const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server/db/radikalbikes.db');
const db = new Database(dbPath);

console.log('=== BOOKINGS ===');
const bookings = db.prepare('SELECT * FROM bookings').all();
console.table(bookings);

console.log('\n=== TIME SLOTS ===');
const slots = db.prepare('SELECT * FROM time_slots LIMIT 10').all();
console.table(slots);

db.close();
