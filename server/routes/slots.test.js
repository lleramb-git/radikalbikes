import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import express from 'express';
import request from 'supertest';

let db;
let app;

/**
 * Build the slots router using a given db instance.
 */
function createRouter(mockDb) {
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const router = express.Router();

  router.get('/:date', (req, res) => {
    const { date } = req.params;

    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido',
      });
    }

    try {
      const rows = mockDb
        .prepare(
          `SELECT id, time, available
           FROM time_slots
           WHERE date = ?
           ORDER BY time`
        )
        .all(date);

      const slots = rows.map((row) => ({
        id: row.id,
        time: row.time,
        available: row.available === 1,
      }));

      return res.json({ date, slots });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}

beforeAll(() => {
  db = new Database(':memory:');
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE time_slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      available INTEGER DEFAULT 1
    );
    CREATE INDEX idx_slots_date ON time_slots(date);
  `);

  const insert = db.prepare(
    'INSERT INTO time_slots (id, date, time, available) VALUES (?, ?, ?, ?)'
  );
  // Dec 2: mixed availability
  insert.run('slot-2024-12-02-0900', '2024-12-02', '09:00', 1);
  insert.run('slot-2024-12-02-1000', '2024-12-02', '10:00', 0);
  insert.run('slot-2024-12-02-1100', '2024-12-02', '11:00', 1);
  // Dec 3: all unavailable
  insert.run('slot-2024-12-03-0900', '2024-12-03', '09:00', 0);

  app = express();
  app.use('/api/slots', createRouter(db));
});

afterAll(() => {
  if (db) db.close();
});

describe('GET /api/slots/:date', () => {
  it('returns slots for a valid date with mixed availability', async () => {
    const res = await request(app).get('/api/slots/2024-12-02');
    expect(res.status).toBe(200);
    expect(res.body.date).toBe('2024-12-02');
    expect(res.body.slots).toHaveLength(3);
    expect(res.body.slots[0]).toEqual({ id: 'slot-2024-12-02-0900', time: '09:00', available: true });
    expect(res.body.slots[1]).toEqual({ id: 'slot-2024-12-02-1000', time: '10:00', available: false });
    expect(res.body.slots[2]).toEqual({ id: 'slot-2024-12-02-1100', time: '11:00', available: true });
  });

  it('returns slots for a date with all unavailable', async () => {
    const res = await request(app).get('/api/slots/2024-12-03');
    expect(res.status).toBe(200);
    expect(res.body.date).toBe('2024-12-03');
    expect(res.body.slots).toHaveLength(1);
    expect(res.body.slots[0]).toEqual({ id: 'slot-2024-12-03-0900', time: '09:00', available: false });
  });

  it('returns empty slots for a date with no data', async () => {
    const res = await request(app).get('/api/slots/2025-06-15');
    expect(res.status).toBe(200);
    expect(res.body.date).toBe('2025-06-15');
    expect(res.body.slots).toEqual([]);
  });

  it('returns 400 for invalid date format (no dashes)', async () => {
    const res = await request(app).get('/api/slots/20241202');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Formato de fecha inválido');
  });

  it('returns 400 for non-date string', async () => {
    const res = await request(app).get('/api/slots/abc');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for partial date', async () => {
    const res = await request(app).get('/api/slots/2024-12');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns slots ordered by time', async () => {
    const res = await request(app).get('/api/slots/2024-12-02');
    expect(res.status).toBe(200);
    const times = res.body.slots.map((s) => s.time);
    expect(times).toEqual(['09:00', '10:00', '11:00']);
  });
});
