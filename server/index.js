const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables and populates default slots)
require('./db/init.js');

const availabilityRoutes = require('./routes/availability.js');
const slotsRoutes = require('./routes/slots.js');
const bookingsRoutes = require('./routes/bookings.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the project root (one level up from server/)
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);

app.listen(PORT, () => {
  console.log(`RadikalBikesRace server running on http://localhost:${PORT}`);
});

module.exports = app;
