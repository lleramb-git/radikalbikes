const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'radikalbikes.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS time_slots (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    available INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS bookings (
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

  CREATE INDEX IF NOT EXISTS idx_slots_date ON time_slots(date);
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
`);

/**
 * Populate default time slots for the next 4 weeks.
 * Monday to Friday, 09:00-14:00 and 16:00-19:00, 1-hour intervals.
 */
function populateDefaultSlots() {
  const existingCount = db.prepare('SELECT COUNT(*) AS count FROM time_slots').get();
  if (existingCount.count > 0) return;

  const morningHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const afternoonHours = ['16:00', '17:00', '18:00', '19:00'];
  const allHours = [...morningHours, ...afternoonHours];

  const insert = db.prepare(
    'INSERT OR IGNORE INTO time_slots (id, date, time, available) VALUES (?, ?, ?, 1)'
  );

  const insertMany = db.transaction((slots) => {
    for (const slot of slots) {
      insert.run(slot.id, slot.date, slot.time);
    }
  });

  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    const dayOfWeek = date.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = formatDate(date);

    for (const time of allHours) {
      const timeCompact = time.replace(':', '');
      const id = `slot-${dateStr}-${timeCompact}`;
      slots.push({ id, date: dateStr, time });
    }
  }

  insertMany(slots);
}

/**
 * Format a Date object as YYYY-MM-DD.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Populate slots on initialization
populateDefaultSlots();

module.exports = db;
