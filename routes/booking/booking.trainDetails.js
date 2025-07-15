const express = require('express');
const router = express.Router();
const { client } = require('../../pg/database.js');

router.post('/', async (req, res) => {
  const { train_name } = req.body;

  if (!train_name) {
    return res.status(400).json({ 
      success: false,
      error: 'train_name is required in the request body' 
    });
  }

  try {
    // Get train info including order_of_stations (as text)
    const trainInfoResult = await client.query(
      `SELECT 
        t.train_code, 
        t.name as train_name, 
        r.route_name, 
        r.order_of_stations
      FROM train t
      JOIN route r ON t.route_id = r.route_id
      WHERE LOWER(t.name) = LOWER($1)`,
      [train_name.trim()]
    );

    if (trainInfoResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: `Train with name '${train_name}' not found` 
      });
    }

  const response = {};

  for(var i=0;i<2;i++)
  {
    const {
      train_code,
      route_name,
      train_name: dbTrainName,
      order_of_stations
    } = trainInfoResult.rows[i];

    // Parse order_of_stations string into an array of integers
    let stationsArray;
    if (typeof order_of_stations === 'string') {
      stationsArray = order_of_stations.trim().split(/\s+/).map(Number);
    } else {
      stationsArray = order_of_stations;
    }

    // Query timetable ordered by station order
    const timetableResult = await client.query(
      `SELECT 
        s.station_name,
        tt.arrival_time,
        tt.departure_time
      FROM unnest($1::int[]) WITH ORDINALITY AS ord_station(station_id, ord)
      JOIN time_table tt ON tt.station_id = ord_station.station_id AND tt.train_code = $2
      JOIN station s ON s.station_id = ord_station.station_id
      ORDER BY ord_station.ord`,
      [stationsArray, train_code]
    );

    // Build timetable pairs (from-to) with durations
    const timetableRows = timetableResult.rows;
    const timetablePairs = [];

    for (let i = 0; i < timetableRows.length - 1; i++) {
      const from = timetableRows[i];
      const to = timetableRows[i + 1];

      timetablePairs.push({
        from_station: from.station_name,
        departure_time: from.departure_time,
        to_station: to.station_name,
        arrival_time: from.arrival_time,
        duration: calculateDuration(from.departure_time, to.arrival_time)
      });
    }
    if(i==0)
    {
      response["UP"] =
      {
        route_name,
        train_code,
        train_name: dbTrainName,
        timetable: timetablePairs
      };
    }
    else
    {
      response["DOWN"] =
      {
        route_name,
        train_code,
        train_name: dbTrainName,
        timetable: timetablePairs
      };
    }
  }
  res.json(response);
} 
  catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Helper function to calculate duration between two times (HH:mm:ss)
function calculateDuration(departure, arrival) {
  try {
    const dep = new Date(`1970-01-01T${departure}`);
    const arr = new Date(`1970-01-01T${arrival}`);

    if (arr < dep) {
      arr.setDate(arr.getDate() + 1);
    }

    const diffMs = arr - dep;
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return `${hours}h ${minutes}m`;
  } catch (e) {
    console.error('Error calculating duration:', e);
    return 'N/A';
  }
}

module.exports = router;

//sami