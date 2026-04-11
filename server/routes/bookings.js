const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db/init.js');
const { validateBookingData } = require('../validation.js');

/**
 * POST /
 * Creates a new booking.
 * Validates input, checks slot existence and availability,
 * then atomically creates the booking and marks the slot as unavailable.
 */
router.post('/', (req, res) => {
  try {
    const { valid, errors, sanitized } = validateBookingData(req.body);

    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { date, slotId, name, phone, email, bikeModel, serviceDescription } = sanitized;

    // Verify slot exists
    const slot = db.prepare('SELECT id, date, time, available FROM time_slots WHERE id = ?').get(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: 'Franja horaria no encontrada',
      });
    }

    // Verify slot is available
    if (slot.available !== 1) {
      return res.status(409).json({
        success: false,
        error: 'La franja horaria seleccionada ya no está disponible',
      });
    }

    // Generate booking ID
    const bookingId = `booking-${crypto.randomUUID()}`;

    // Atomic transaction: insert booking + mark slot unavailable
    const createBooking = db.transaction(() => {
      db.prepare(
        `INSERT INTO bookings (id, date, slot_id, name, phone, email, bike_model, service_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(bookingId, date, slotId, name, phone, email, bikeModel, serviceDescription);

      db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(slotId);
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
    console.error('Error creating booking:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

module.exports = router;
