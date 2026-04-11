const express = require('express');
const router = express.Router();
const db = require('../db/init.js');

/**
 * GET /:year/:month
 * Returns availability for each day of the requested month.
 * Response: { year, month, days: [{ date, available }] }
 */
router.get('/:year/:month', (req, res) => {
  const { year, month } = req.params;

  // Validate year and month are numeric
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
    // Query all time_slots for the given month, grouped by date
    const rows = db
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

    return res.json({
      year: yearNum,
      month: monthNum,
      days,
    });
  } catch (err) {
    console.error('Error fetching availability:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

module.exports = router;
