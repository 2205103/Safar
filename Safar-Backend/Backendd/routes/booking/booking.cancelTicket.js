const express = require('express');
const router = express.Router();
const { client } = require('../../pg/database.js');
const checkToken = require('../../middlewares/checkToken.js');

router.post('/', checkToken, async (req, res) => {
  const { ticket_id } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id is required' });
  }

  try {
    // Combine date and departure_time in PostgreSQL and compute time difference in hours
    const result = await client.query(
      `SELECT 
          t.total_cost, 
          (sr.date + tt.departure_time) AS departure_datetime,
          EXTRACT(EPOCH FROM ((sr.date + tt.departure_time) - CURRENT_TIMESTAMP)) / 3600 AS time_diff_hours
       FROM ticket t
       JOIN seat_reservation sr ON t.ticket_id = sr.ticket_id
       JOIN time_table tt ON tt.train_code = sr.train_code AND tt.station_id::text = sr.from_station
       WHERE t.ticket_id = $1
       LIMIT 1`,
      [ticket_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { total_cost, time_diff_hours } = result.rows[0];
    const hours = parseFloat(time_diff_hours);

    let refundAmount = 0;
    let message = '';

    if (hours > 48) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.10);
      message = '10% deduction (min BDT 40)';
    } else if (hours > 24) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.25);
      message = '25% deduction (min BDT 40)';
    } else if (hours > 12) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.50);
      message = '50% deduction (min BDT 40)';
    } else if (hours > 6) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.75);
      message = '75% deduction (min BDT 40)';
    } else {
      return res.status(400).json({
        error: 'No refund if cancelled within 6 hours of departure',
        refund_amount: 0
      });
    }

    // Cancel the ticket
    await client.query(`DELETE FROM ticket WHERE ticket_id = $1`, [ticket_id]);

    return res.status(200).json({
      refund_amount: Math.round(refundAmount),
      message: message
    });

  } catch (err) {
    console.error('Error cancelling ticket:', err);
    return res.status(500).json({ error: 'Failed to cancel ticket' });
  }
});

module.exports = router;
