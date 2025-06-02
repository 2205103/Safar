const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');

router.post('/', async (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : [req.body];

  // Basic validation for all entries
  for (const [index, entry] of entries.entries()) {
    const { User_id, Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station } = entry;
    if (!User_id || !Train_Code || !Class_Code || !Seat_Number || !Date || !From_Station || !To_Station) {
      return res.status(400).json({ error: `Missing required fields in entry at index ${index}` });
    }
  }

  // Assume all entries have same User_id (if not, pick the first)
  const User_id = entries[0].User_id;
  let ticket_id;

  try {
    await client.query('BEGIN');

    // Generate a new ticket_id
    const result = await client.query(`SELECT COALESCE(MAX(ticket_id), 0) + 1 AS ticket_id FROM ticket;`);
    ticket_id = result.rows[0].ticket_id;

    // Insert the ticket only once
    await client.query(
      `INSERT INTO ticket (ticket_id, user_id) VALUES ($1, $2);`,
      [ticket_id, User_id]
    );

    // Insert each seat reservation under the same ticket_id
  let total_cost = 0;

for (const entry of entries) {
  const { Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station } = entry;

  //Get distance
  const distanceResult = await client.query(
    `SELECT distance_unit FROM distance_storage WHERE (from_station = $1 AND to_station = $2) or (to_station=$1 AND from_station=$2)`,
    [From_Station, To_Station]
  );
  if (distanceResult.rows.length === 0) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: `Distance not found between ${From_Station} and ${To_Station}` });
  }
  const distance = distanceResult.rows[0].distance_unit;

  // Get cost per unit
  const costResult = await client.query(
    `SELECT cost_per_unit FROM class WHERE class_code = $1`,
    [Class_Code]
  );
  if (costResult.rows.length === 0) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: `Cost info not found for class ${Class_Code}` });
  }
  const costPerUnit = costResult.rows[0].cost_per_unit;

  total_cost += costPerUnit * distance;

  // Insert reservation
  await client.query(
    `INSERT INTO seat_reservation (ticket_id, train_code, class_code, seat_number, date, from_station, to_station)
     VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    [ticket_id, Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station]
  );
}
  await client.query(
  `UPDATE ticket SET total_cost = $1 WHERE ticket_id = $2`,
  [total_cost, ticket_id]
  );

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Ticket created successfully', ticket_id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating ticket with seat reservations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
