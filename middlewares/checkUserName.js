const { client } = require('../pg/database.js'); // assuming pg Pool client
const pool = client;

const checkDoubleTicket = async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const query = 'SELECT COUNT(*) FROM passenger WHERE username = $1'; // Adjust table/column as needed
    const { rows } = await pool.query(query, [username]);

    if (rows[0].count !== '0') {
      // username exists
      return res.status(409).json({ error: 'Username already exists' });
    }

    next(); // username not found, continue
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkDoubleTicket;
