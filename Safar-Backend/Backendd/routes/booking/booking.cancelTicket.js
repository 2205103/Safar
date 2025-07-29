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
    // Fetch total_cost, departure_time, and journey date
    const result = await client.query(
      `SELECT t.total_cost, tt.departure_time, s.date
       FROM ticket t
       JOIN seat_reservation s ON t.ticket_id = s.ticket_id
       JOIN time_table tt ON tt.train_code = s.train_code AND tt.station_id::text = s.from_station
       WHERE t.ticket_id = $1`,
      [ticket_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { total_cost, departure_time, date } = result.rows[0];

    // Combine date and time to get full departure datetime
    const journeyDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const departureDateTimeStr = `${journeyDate}T${departure_time}`; // ISO string
    const departureDateTime = new Date(departureDateTimeStr);

    const now = new Date();
    const timeDiffHours = (departureDateTime - now) / (1000 * 60 * 60); // ms → hrs

    let refundAmount = 0;
    let message = '';

    if (timeDiffHours > 48) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.10);
      message = '10% deduction (min BDT 40)';
    } else if (timeDiffHours > 24) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.25);
      message = '25% deduction (min BDT 40)';
    } else if (timeDiffHours > 12) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.50);
      message = '50% deduction (min BDT 40)';
    } else if (timeDiffHours > 6) {
      refundAmount = total_cost - Math.max(40, total_cost * 0.75);
      message = '75% deduction (min BDT 40)';
    } else {
      return res.status(400).json({
        error: 'No refund if cancelled within 6 hours of departure',
        refund_amount: 0
      });
    }

    // Delete the ticket
    await client.query(
      `DELETE FROM ticket WHERE ticket_id = $1`,
      [ticket_id]
    );

    //console.log(`Refund of ${refundAmount} done successfully.`);
    return res.status(200).json({
      refund_amount: refundAmount,
      message: message
    });

  } catch (err) {
    //console.error('Error cancelling ticket:', err.message);
    return res.status(500).json({ error: 'Failed to cancel ticket' });
  }
});

module.exports = router;
