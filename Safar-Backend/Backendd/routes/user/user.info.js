const express = require('express');
const router = express.Router();
const {client} = require('../../pg/database.js');

router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const queryText = `
      SELECT name, phone_number
      FROM passenger
      WHERE user_id = $1
      LIMIT 1
    `;
    const { rows } = await client.query(queryText, [userId]);

    if (rows.length === 0) {
      return res.json({ data: { result: null } });
    }

    const { name, phone_number } = rows[0];

    let first_name = 'NULL';
    let last_name = 'NULL';

    if (name && name.trim().length > 0) {
      const nameParts = name.trim().split(' ');
      first_name = nameParts[0];
      last_name = nameParts.slice(1).join(' ') || 'NULL';
    }

    return res.json({
      data: {
        result: {
          user_id: userId,
          first_name,
          last_name,
          phone_number: phone_number || 'NULL',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
