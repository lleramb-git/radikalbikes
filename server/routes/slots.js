const express = require('express');
const router = express.Router();
const db = require('../db/init.js');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /:date
 * Returns time slots for the requested date.
 * Response: { date, slots: [{ id, time, available }] }
 */
router.get('/:date', (req, res) => {
  const { date } = req.params;

  // Validate date format YYYY-MM-DD
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({
      success: false,
      error: 'Formato de fecha inválido',
    });
  }

  try {
    const rows = db
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
    console.error('Error fetching slots:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

module.exports = router;
