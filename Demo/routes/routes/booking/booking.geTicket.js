const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');

router.get('/', async (req, res) => {
  const { ticket_id } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id is required in request body' });
  }

  try {
    const result = await client.query(`
      SELECT 
        t.name AS train_name, 
        c.class_name, 
        s_from.station_name AS from_station_name, 
        s_to.station_name AS to_station_name, 
        seat_number
      FROM seat_reservation sr
      JOIN train t ON t.train_code = sr.train_code
      JOIN class c ON c.class_code = sr.class_code
      JOIN station s_from ON s_from.station_id = sr.from_station::int
      JOIN station s_to ON s_to.station_id = sr.to_station::int
      WHERE ticket_id = $1;
    `, [ticket_id]);

    const groupedData = {};

    for (const row of result.rows) {
      const key = `${row.train_name}_${row.class_name}_${row.from_station_name}_${row.to_station_name}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          train_code: row.train_name,
          class_code: row.class_name,
          from: row.from_station_name,
          to: row.to_station_name,
          seats: []
        };
      }

      groupedData[key].seats.push(Number(row.seat_number));
    }

    res.json(Object.values(groupedData));
  } catch (err) {
    console.error('Error fetching ticket data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;