import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import express from 'express';
import request from 'supertest';

// Create an in-memory database and app for testing
let db;
let app;

/**
 * Build the availability router using a given db instance.
 */
function createRouter(mockDb) {
  const router = express.Router();

  router.get('/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const yearNum = Number(year);
    const monthNum = Number(month);

    if (
      !Number.isInteger(yearNum) ||
      !Number.isInteger(monthNum) ||
      yearNum < 1970 ||
      yearNum > 9999 ||
      monthNum < 1 ||
      monthNum > 12
    ) {
      return res.status(400).json({
        success: false,
        error: 'Formato de año o mes inválido',
      });
    }

    const monthStr = String(monthNum).padStart(2, '0');
    const prefix = `${yearNum}-${monthStr}`;

    try {
      const rows = mockDb
        .prepare(
          `SELECT date, MAX(available) AS has_available
           FROM time_slots
           WHERE date LIKE ? || '%'
           GROUP BY date
           ORDER BY date`
        )
        .all(prefix + '-');

      const days = rows.map((row) => ({
        date: row.date,
        available: row.has_available === 1,
      }));

      return res.json({ year: yearNum, month: monthNum, days });
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
  // Dec 2: one available, one not → day is available
  insert.run('slot-2024-12-02-0900', '2024-12-02', '09:00', 1);
  insert.run('slot-2024-12-02-1000', '2024-12-02', '10:00', 0);
  // Dec 3: all unavailable → day is not available
  insert.run('slot-2024-12-03-0900', '2024-12-03', '09:00', 0);
  insert.run('slot-2024-12-03-1000', '2024-12-03', '10:00', 0);
  // Dec 4: one available
  insert.run('slot-2024-12-04-0900', '2024-12-04', '09:00', 1);

  app = express();
  app.use('/api/availability', createRouter(db));
});

afterAll(() => {
  if (db) db.close();
});

describe('GET /api/availability/:year/:month', () => {
  it('returns availability for a valid month', async () => {
    const res = await request(app).get('/api/availability/2024/12');
    expect(res.status).toBe(200);
    expect(res.body.year).toBe(2024);
    expect(res.body.month).toBe(12);
    expect(res.body.days).toHaveLength(3);
    expect(res.body.days[0]).toEqual({ date: '2024-12-02', available: true });
    expect(res.body.days[1]).toEqual({ date: '2024-12-03', available: false });
    expect(res.body.days[2]).toEqual({ date: '2024-12-04', available: true });
  });

  it('returns empty days for a month with no slots', async () => {
    const res = await request(app).get('/api/availability/2025/06');
    expect(res.status).toBe(200);
    expect(res.body.year).toBe(2025);
    expect(res.body.month).toBe(6);
    expect(res.body.days).toEqual([]);
  });

  it('returns 400 for month 0', async () => {
    const res = await request(app).get('/api/availability/2024/0');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for month 13', async () => {
    const res = await request(app).get('/api/availability/2024/13');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for non-numeric year', async () => {
    const res = await request(app).get('/api/availability/abc/12');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for non-numeric month', async () => {
    const res = await request(app).get('/api/availability/2024/abc');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('handles single-digit month correctly', async () => {
    const res = await request(app).get('/api/availability/2024/1');
    expect(res.status).toBe(200);
    expect(res.body.month).toBe(1);
    expect(res.body.days).toEqual([]);
  });
});
