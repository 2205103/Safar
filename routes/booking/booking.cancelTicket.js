const express = require('express');
const router = express.Router();
const {client} = require('../../pg/database.js');
const checkToken = require('../../middlewares/checkToken.js');

router.post('/', checkToken, async (req, res) => {
  const { ticket_id } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id is required in request body' });
  }

  try {
    const result = await client.query(
      `DELETE
      FROM ticket
      WHERE ticket_id = $1`, [ticket_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found or already cancelled' });
    }

    return res.status(200).json({ message: 'Ticket cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling ticket:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;