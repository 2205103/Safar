const express = require('express');
const router = express.Router();
const { client } = require('../../pg/database.js');

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT station_name FROM station');

    if (result.rows.length > 0) {
      const stationNames = result.rows.map(row => row.station_name);
      res.json({ stationNames: stationNames }); // send names as array of strings
    } else {
      res.status(404).json({ error: 'No stations found' });
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
