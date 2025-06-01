const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');

router.post('/', async (req, res) => {
  const { Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station } = req.body;

  if (!Train_Code || !Class_Code || !Seat_Number || !Date || !From_Station || !To_Station) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  let ticket_id;

  try {
    const result = await client.query(
      `SELECT COALESCE(MAX(ticket_id), 0) + 1 AS ticket_id FROM ticket;`
    );
    ticket_id = result.rows[0].ticket_id; // fixed: extract rows from query result object
  } catch (err) {
    console.error('Error fetching ticket_id', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    await client.query(
      `INSERT INTO TICKET(TICKET_ID)
       VALUES ($1)`, [ticket_id]
    ); 
    // removed .rows[0].ticket_id - INSERT returns command status, no rows here
  } catch (err) {
    console.error('Error inserting ticket', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    await client.query(
      `INSERT INTO SEAT_RESERVATION(TICKET_ID, TRAIN_CODE, CLASS_CODE, SEAT_NUMBER, DATE, FROM_STATION, TO_STATION)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [ticket_id, Train_Code, Class_Code, Seat_Number, Date, From_Station, To_Station]
    );

    return res.status(201).json({ message: 'Ticket created successfully', ticket_id }); // respond success
  } catch (err) {
    console.error('Error inserting seat reservation', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;