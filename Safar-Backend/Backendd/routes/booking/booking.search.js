const express = require('express');
const router = express.Router();
const {client, getUnavailableSeats} = require('../../pg/database.js');

function comesBefore(str, first, second) {
  const arr = str.trim().split(' ');
  return arr.indexOf(first.toString()) < arr.indexOf(second.toString());
}

router.post('/', async (req, res) => {
  const { fromcity, tocity, doj } = req.body;
  if (!fromcity || !tocity || !doj) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const stationRes = await client.query(
      `SELECT station_id, station_name FROM station WHERE station_name = $1 OR station_name = $2;`,
      [fromcity, tocity]
    );
    if (stationRes.rows.length < 2) {
      return res.status(404).json({ error: 'One or both stations not found.' });
    }

    const stationMap = {};
    stationRes.rows.forEach(r => (stationMap[r.station_name] = r.station_id));
    const fromStationId = stationMap[fromcity];
    const toStationId = stationMap[tocity];

    const routesResult = await client.query(
      `
      SELECT R1.route_id
      FROM route_station R1
      JOIN station S1 ON R1.station_id = S1.station_id
      WHERE S1.station_name = $1
      INTERSECT
      SELECT R2.route_id
      FROM route_station R2
      JOIN station S2 ON R2.station_id = S2.station_id
      WHERE S2.station_name = $2;
      `,
      [fromcity, tocity]
    );
    const possibleRoutes = routesResult.rows;

    for (const route of possibleRoutes) {
      const seqRes = await client.query(
        `SELECT order_of_stations FROM route WHERE route_id = $1;`,
        [route.route_id]
      );
      route.station_sequence = seqRes.rows[0].order_of_stations;
    }

    const filteredRoutes = possibleRoutes.filter(route =>
      comesBefore(route.station_sequence, fromStationId, toStationId)
    );

    const allTrains = [];
    for (const route of filteredRoutes) {
      const trainRes = await client.query(
        `SELECT TRAIN_CODE, NAME FROM TRAIN WHERE ROUTE_ID = $1;`,
        [route.route_id]
      );
      allTrains.push(...trainRes.rows);
    }

    const trainResult = [];

    for (const train of allTrains) {
      const classRes = await client.query(
        `SELECT A.CLASS_CODE, B.CLASS_NAME, A.TOTAL_SEAT
        FROM SEAT A JOIN CLASS B ON (A.CLASS_CODE = B.CLASS_CODE)
        WHERE A.TRAIN_CODE = $1;`,
        [train.train_code]
      );

      const classMap = {};
      const classTotalMap = {};
      classRes.rows.forEach(r => {
        classMap[r.class_code] = r.class_name;
        classTotalMap[r.class_code] = r.total_seat;
      });
      const allClassCodes = Object.keys(classMap);

      const trainCode = train.train_code;
      const trainName = train.name;

      const unavailableSeats = await getUnavailableSeats(
        trainCode,
        fromStationId,
        toStationId,
        doj
      );

      const grouped = {};
      for (const row of unavailableSeats) {
        const className = classMap[row.class_code] || row.class_code;
        if (!grouped[className]) grouped[className] = [];
        grouped[className].push(row.seat_number);
      }

      const classList = [];
      for (const classCode of allClassCodes) {
        const className = classMap[classCode];
        const totalSeats = classTotalMap[classCode] || 0;
        classList.push({
          class_name: className,
          class_code: classCode,
          total_seat: totalSeats,
          Booked_Seats: grouped[className] || [],
        });
      }

      // Add cost calculation for each class
      for (const cls of classList) {
        const costResult = await client.query(
          `SELECT 
            c.cost_per_unit,
            ds.distance_unit,
            ROUND(c.cost_per_unit * ds.distance_unit, 2) AS seat_cost
           FROM 
            class c
           CROSS JOIN 
            (SELECT distance_unit 
             FROM distance_storage 
             WHERE (from_station = $1 AND to_station = $2)
                OR (from_station = $2 AND to_station = $1)
             LIMIT 1) ds
           WHERE 
            c.class_code = $3`,
          [fromStationId, toStationId, cls.class_code]
        );

        if (costResult.rows.length > 0) {
          cls.seat_cost = costResult.rows[0].seat_cost;
        }
      }
      const fromStationDeparture = await client.query(
        `SELECT departure_time FROM time_table WHERE train_code = $1 AND station_id = $2;`,
        [trainCode, fromStationId]
      );

      const fromStationDepartureTime = fromStationDeparture.rows[0]?.departure_time;
      
      const toStationArrival = await client.query(
        `SELECT arrival_time FROM time_table WHERE train_code = $1 AND station_id = $2;`,
        [trainCode, toStationId]
      );

      const toStationArrivalTime = toStationArrival.rows[0]?.arrival_time;

      trainResult.push({
        train_code: trainCode,
        train_name: trainName,
        classes: classList,
        from_station_departure: fromStationDepartureTime,
        to_station_arrival: toStationArrivalTime,
      });

    }
    
    res.json({
      message: 'Route details fetched successfully',
      data: trainResult,
    });
  } catch (err) {
    console.error('Error fetching routes or stations', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;