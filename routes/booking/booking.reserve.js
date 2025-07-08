const express = require('express');
const router = express.Router();
const {client} = require('../../pg/database.js');
const checkToken = require('../../middlewares/checkToken.js');

router.post('/', checkToken, async (req, res) => {
  const { User_id, Train_Code, Date, From_Station, To_Station } = req.body;

  // Normalize seat details array
  const rawEntries = Array.isArray(req.body.Seat_Details) ? req.body.Seat_Details : [req.body.Seat_Details];
  const entries = [];

  for (const entry of rawEntries) {
    const { Class_Code, Seat_Number } = entry;

    if (Array.isArray(Seat_Number)) {
      for (const seat of Seat_Number) {
        entries.push({ Class_Code, Seat_Number: seat });
      }
    } else {
      entries.push({ Class_Code, Seat_Number });
    }
  }

  // Validate required fields
  for (const entry of entries) {
    const { Class_Code, Seat_Number } = entry;
    if (!User_id || !Train_Code || !Class_Code || !Seat_Number || !Date || !From_Station || !To_Station) {
      return res.status(400).json({ error: `Missing required fields` });
    }
  }

  try {
    await client.query('BEGIN');

    // Insert ticket without ticket_id (will auto-generate)
    const insertTicketResult = await client.query(
      `INSERT INTO ticket (user_id) VALUES ($1) RETURNING ticket_id`,
      [User_id]
    );
    const ticket_id = insertTicketResult.rows[0].ticket_id;

    let total_cost = 0;

    for (const entry of entries) {
      const { Class_Code, Seat_Number } = entry;

      // Get station IDs
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

      // Insert seat reservation
      await client.query(
        `INSERT INTO seat_reservation (ticket_id, train_code, class_code, seat_number, date, from_station, to_station)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ticket_id, Train_Code, Class_Code, Seat_Number, Date, from_station_id, to_station_id]
      );
    }

    // Update ticket with total cost
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