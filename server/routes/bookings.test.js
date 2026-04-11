import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import express from 'express';
import request from 'supertest';
import crypto from 'crypto';

let db;
let app;

/**
 * Build the bookings router using a given db instance.
 */
function createRouter(mockDb) {
  const router = express.Router();

  // Inline validateBookingData to avoid coupling to the real module's db import
  const REQUIRED_FIELDS = [
    { key: 'date', label: 'fecha' },
    { key: 'slotId', label: 'franja horaria' },
    { key: 'name', label: 'nombre' },
    { key: 'phone', label: 'teléfono' },
    { key: 'email', label: 'correo electrónico' },
    { key: 'bikeModel', label: 'modelo de moto' },
    { key: 'serviceDescription', label: 'descripción del servicio' },
  ];
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\+?\d[\d\s\-]{5,}$/;
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  function sanitize(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/<[^>]*>/g, '').trim();
  }

  function validateBookingData(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: [{ field: 'general', message: 'Los datos de reserva son inválidos' }] };
    }
    const sanitized = {};
    for (const { key } of REQUIRED_FIELDS) {
      sanitized[key] = sanitize(data[key] != null ? String(data[key]) : '');
    }
    for (const { key, label } of REQUIRED_FIELDS) {
      if (!sanitized[key]) {
        errors.push({ field: key, message: `El campo ${label} es obligatorio` });
      }
    }
    if (sanitized.email && !EMAIL_REGEX.test(sanitized.email)) {
      errors.push({ field: 'email', message: 'El formato del email no es válido' });
    }
    if (sanitized.phone && !PHONE_REGEX.test(sanitized.phone)) {
      errors.push({ field: 'phone', message: 'El formato del teléfono no es válido' });
    }
    if (sanitized.date && !DATE_REGEX.test(sanitized.date)) {
      errors.push({ field: 'date', message: 'El formato de la fecha debe ser YYYY-MM-DD' });
    }
    return { valid: errors.length === 0, errors, sanitized };
  }

  router.post('/', (req, res) => {
    try {
      const { valid, errors, sanitized } = validateBookingData(req.body);
      if (!valid) {
        return res.status(400).json({ success: false, errors });
      }

      const { date, slotId, name, phone, email, bikeModel, serviceDescription } = sanitized;

      const slot = mockDb.prepare('SELECT id, date, time, available FROM time_slots WHERE id = ?').get(slotId);
      if (!slot) {
        return res.status(404).json({ success: false, error: 'Franja horaria no encontrada' });
      }
      if (slot.available !== 1) {
        return res.status(409).json({ success: false, error: 'La franja horaria seleccionada ya no está disponible' });
      }

      const bookingId = `booking-${crypto.randomUUID()}`;

      const createBooking = mockDb.transaction(() => {
        mockDb.prepare(
          `INSERT INTO bookings (id, date, slot_id, name, phone, email, bike_model, service_description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(bookingId, date, slotId, name, phone, email, bikeModel, serviceDescription);
        mockDb.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(slotId);
      });

      createBooking();

      return res.status(201).json({
        success: true,
        booking: {
          id: bookingId,
          date: slot.date,
          time: slot.time,
          name,
          bikeModel,
          serviceDescription,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  });

  return router;
}

const VALID_BOOKING = {
  date: '2024-12-02',
  slotId: 'slot-2024-12-02-0900',
  name: 'Juan García',
  phone: '612345678',
  email: 'juan@example.com',
  bikeModel: 'Yamaha MT-07',
  serviceDescription: 'Revisión general y cambio de aceite',
};

function resetDb() {
  db.exec('DELETE FROM bookings');
  db.exec('UPDATE time_slots SET available = 1');
}

beforeAll(() => {
  db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE time_slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      available INTEGER DEFAULT 1
    );
    CREATE TABLE bookings (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      slot_id TEXT NOT NULL REFERENCES time_slots(id),
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      bike_model TEXT NOT NULL,
      service_description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(slot_id)
    );
    CREATE INDEX idx_slots_date ON time_slots(date);
    CREATE INDEX idx_bookings_date ON bookings(date);
  `);

  const insert = db.prepare(
    'INSERT INTO time_slots (id, date, time, available) VALUES (?, ?, ?, ?)'
  );
  insert.run('slot-2024-12-02-0900', '2024-12-02', '09:00', 1);
  insert.run('slot-2024-12-02-1000', '2024-12-02', '10:00', 1);
  insert.run('slot-2024-12-02-1100', '2024-12-02', '11:00', 0); // already booked

  app = express();
  app.use(express.json());
  app.use('/api/bookings', createRouter(db));
});

afterAll(() => {
  if (db) db.close();
});

beforeEach(() => {
  resetDb();
  // Re-mark 11:00 slot as unavailable for consistent test state
  db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run('slot-2024-12-02-1100');
});

describe('POST /api/bookings', () => {
  it('creates a booking successfully and returns 201', async () => {
    const res = await request(app).post('/api/bookings').send(VALID_BOOKING);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.id).toMatch(/^booking-/);
    expect(res.body.booking.date).toBe('2024-12-02');
    expect(res.body.booking.time).toBe('09:00');
    expect(res.body.booking.name).toBe('Juan García');
    expect(res.body.booking.bikeModel).toBe('Yamaha MT-07');
    expect(res.body.booking.serviceDescription).toBe('Revisión general y cambio de aceite');
  });

  it('marks the slot as unavailable after booking', async () => {
    await request(app).post('/api/bookings').send(VALID_BOOKING);

    const slot = db.prepare('SELECT available FROM time_slots WHERE id = ?').get('slot-2024-12-02-0900');
    expect(slot.available).toBe(0);
  });

  it('creates a record in the bookings table', async () => {
    await request(app).post('/api/bookings').send(VALID_BOOKING);

    const booking = db.prepare('SELECT * FROM bookings WHERE slot_id = ?').get('slot-2024-12-02-0900');
    expect(booking).toBeDefined();
    expect(booking.name).toBe('Juan García');
    expect(booking.phone).toBe('612345678');
    expect(booking.email).toBe('juan@example.com');
    expect(booking.bike_model).toBe('Yamaha MT-07');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/bookings').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 400 with specific field errors for invalid email', async () => {
    const res = await request(app).post('/api/bookings').send({
      ...VALID_BOOKING,
      email: 'not-an-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('returns 404 when slot does not exist', async () => {
    const res = await request(app).post('/api/bookings').send({
      ...VALID_BOOKING,
      slotId: 'slot-nonexistent',
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Franja horaria no encontrada');
  });

  it('returns 409 when slot is already booked', async () => {
    const res = await request(app).post('/api/bookings').send({
      ...VALID_BOOKING,
      slotId: 'slot-2024-12-02-1100',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('La franja horaria seleccionada ya no está disponible');
  });

  it('returns 409 on duplicate booking for the same slot', async () => {
    // First booking succeeds
    const first = await request(app).post('/api/bookings').send(VALID_BOOKING);
    expect(first.status).toBe(201);

    // Second booking for same slot fails
    const second = await request(app).post('/api/bookings').send({
      ...VALID_BOOKING,
      name: 'María López',
      email: 'maria@example.com',
    });
    expect(second.status).toBe(409);
  });

  it('returns 400 with invalid date format', async () => {
    const res = await request(app).post('/api/bookings').send({
      ...VALID_BOOKING,
      date: '02-12-2024',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'date')).toBe(true);
  });
});
