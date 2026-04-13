const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'radikalbikes.db');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
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
      created_at TEXT NOT NULL,
      UNIQUE(slot_id)
    );

    CREATE INDEX IF NOT EXISTS idx_slots_date ON time_slots(date);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  `);

  populateDefaultSlots();
  saveDatabase();
  
  return db;
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function populateDefaultSlots() {
  const result = db.exec('SELECT COUNT(*) AS count FROM time_slots');
  const count = result[0]?.values[0]?.[0] || 0;
  if (count > 0) return;

  const morningHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const afternoonHours = ['16:00', '17:00', '18:00', '19:00'];
  const allHours = [...morningHours, ...afternoonHours];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = formatDate(date);

    for (const time of allHours) {
      const timeCompact = time.replace(':', '');
      const id = `slot-${dateStr}-${timeCompact}`;
      db.run(
        'INSERT OR IGNORE INTO time_slots (id, date, time, available) VALUES (?, ?, ?, 1)',
        [id, dateStr, time]
      );
    }
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper functions to match better-sqlite3 API
function prepare(sql) {
  return {
    get: (...params) => {
      const result = db.exec(sql, params);
      if (result.length === 0) return undefined;
      const columns = result[0].columns;
      const values = result[0].values[0];
      if (!values) return undefined;
      const row = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      return row;
    },
    all: (...params) => {
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      const columns = result[0].columns;
      return result[0].values.map(values => {
        const row = {};
        columns.forEach((col, i) => {
          row[col] = values[i];
        });
        return row;
      });
    },
    run: (...params) => {
      db.run(sql, params);
      saveDatabase();
      return { changes: db.getRowsModified() };
    }
  };
}

module.exports = {
  initDatabase,
  getDb: () => db,
  prepare,
  saveDatabase
};
