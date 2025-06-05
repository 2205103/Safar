const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');
const checkReserve = require('../../middlewares/checkReserve.js');

router.post('/', checkReserve, async (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : [req.body];

  // Basic validation for all entries
  for (const [index, entry] of entries.entries()) {
    const { User_id, Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station } = entry;
    if (!User_id || !Train_Code || !Class_Code || !Seat_Number || !Date || !From_Station || !To_Station) {
      return res.status(400).json({ error: `Missing required fields in entry at index ${index}` });
    }
  }

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

    let total_cost = 0;

    for (const entry of entries) {
      const { Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station } = entry;

      // Convert station names to IDs
      const fromStationResult = await client.query(
        `SELECT station_id FROM station WHERE station_name = $1`,
        [From_Station]
      );
      const toStationResult = await client.query(
        `SELECT station_id FROM station WHERE station_name = $1`,
        [To_Station]
      );

      if (fromStationResult.rows.length === 0 || toStationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Invalid station name: ${From_Station} or ${To_Station}` });
      }

      const from_station_id = fromStationResult.rows[0].station_id;
      const to_station_id = toStationResult.rows[0].station_id;

      // Get distance
      const distanceResult = await client.query(
        `SELECT distance_unit FROM distance_storage WHERE 
         (from_station = $1 AND to_station = $2) 
         OR (from_station = $2 AND to_station = $1)`,
        [from_station_id, to_station_id]
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

      // Insert seat reservation using station IDs
      await client.query(
        `INSERT INTO seat_reservation (ticket_id, train_code, class_code, seat_number, date, from_station, to_station)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [ticket_id, Train_Code, Class_Code, Seat_Number, Date, from_station_id, to_station_id]
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