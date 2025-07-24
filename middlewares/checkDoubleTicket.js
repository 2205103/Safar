const {client} = require('../pg/database.js'); // assuming you use pg Pool
const pool = client;

const checkDoubleTicket = async (req, res, next) => {
  const { User_id, Date } = req.body;

  if (!User_id || !Date) {
    return res.status(400).json({ error: "User_id and Date are required." });
  }

  try {
    const query = `
      SELECT 1 FROM ticket t
      JOIN seat_reservation sr ON t.ticket_id = sr.ticket_id
      WHERE t.user_id = $1 AND sr.date = $2
      LIMIT 1
    `;
    const values = [User_id, Date];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      return res.status(413).json({ error: "User already has a ticket for this date." });
    }

    next();
  } catch (error) {
    console.error("checkDoubleTicket error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = checkDoubleTicket;
