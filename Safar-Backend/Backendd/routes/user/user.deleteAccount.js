const express = require('express');
const router = express.Router();
const {client} = require('../../pg/database.js');
const bcrypt = require("bcrypt");

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  try {
    const checkQuery = 'SELECT password FROM passenger WHERE user_id = $1';
    const result = await client.query(checkQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const hashedPassword = result.rows[0].password;

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const deleteQuery = 'DELETE FROM passenger WHERE user_id = $1';
    await client.query(deleteQuery, [userId]);

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports=router;
