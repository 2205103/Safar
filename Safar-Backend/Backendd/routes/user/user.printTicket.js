const express = require('express');
const router = express.Router();
const { client } = require('../../pg/database.js'); // your pg Pool setup
const pool = client;

// GET /user/tickets/:user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        p.name,
        p.phone_number,
        json_agg(json_build_object(
          'total_cost', t.total_cost,
          'ticket_id', sr.ticket_id,
          'seat_number', sr.seat_number,
          'class_code', (SELECT P.CLASS_NAME FROM CLASS P WHERE P.CLASS_CODE = sr.CLASS_CODE::integer),
          'train_code', A.NAME,
          'from_station', (SELECT P.STATION_NAME FROM STATION P WHERE P.STATION_ID = sr.from_station::integer),
          'to_station', (SELECT P.STATION_NAME FROM STATION P WHERE P.STATION_ID = sr.to_station::integer),
          'date', sr.date,
          'arrival_time', tt.arrival_time,
          'time_remaining', (sr.date + tt.arrival_time) - CURRENT_TIMESTAMP
        )) AS seat_reservations
      FROM passenger p
      JOIN ticket t ON p.user_id = t.user_id
      JOIN seat_reservation sr ON t.ticket_id = sr.ticket_id
      JOIN TRAIN A ON sr.TRAIN_CODE = A.TRAIN_CODE
      JOIN time_table tt ON tt.train_code = sr.train_code AND tt.station_id = sr.from_station::integer
      WHERE p.user_id = $1
      GROUP BY p.user_id, p.name, p.phone_number;
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No records found.' });
    }
    console.log('time remaining:', result.rows[0].seat_reservations.map(sr => sr.time_remaining));
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Ticket history error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
