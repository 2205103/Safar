const express = require('express');
const app = express();
const pg = require('../../pg/database.js');

app.get('/', async (req, res) => {
  try {
    const result = await pg.client.query('SELECT DISTINCT name FROM train');
    const trainNames = result.rows.map(row => row.name);
    
    // 🔁 Rename key to 'name' to match frontend
    res.json({ success: true, name: trainNames });
  } catch (error) {
    console.error('Error fetching train names:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = app;
