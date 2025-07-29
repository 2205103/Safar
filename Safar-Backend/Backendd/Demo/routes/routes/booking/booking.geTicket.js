const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');
const checkGeTicket = require('../../middlewares/checkGeTicket.js')

router.post('/', checkGeTicket, async (req, res) => {
  const { User_id, ticket_id } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id is required in request body' });
  }

  const abc = await client.query(`
  SELECT total_cost, user_id FROM TICKET WHERE TICKET_ID = $1;
`, [ticket_id]);

if (abc.rows.length === 0) {
  return res.status(404).json({ error: 'Ticket not found' });
}

const { user_id, total_cost } = abc.rows[0]; // ✅ safe and correct now

if (user_id !== User_id) {
  return res.status(401).json({ error: 'Unauthorized access to ticket' });
}



  try {
    const result = await client.query(`
      SELECT 
        sr.date AS date,
        t.train_code AS train_code,
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
    
    const {date,train_code,train_name,from_station_name,to_station_name} = result.rows[0];
    const formattedDate = date.toISOString().split('T')[0];
    const groupedData = {};

    for (const row of result.rows) {
      const key = `${row.train_name}_${row.class_name}_${row.from_station_name}_${row.to_station_name}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          class_code: row.class_name,
          seats: []
        };
      }

      groupedData[key].seats.push(Number(row.seat_number));
    }

    res.json({
      train_code: train_code,
      train_name: train_name,
      From : from_station_name,
      To : to_station_name,
      Journey_date : formattedDate,
      Seat_details : Object.values(groupedData),
      total_cost : total_cost
    });
  } catch (err) {
    console.error('Error fetching ticket data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;