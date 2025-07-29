const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');

function comesBefore(str, first, second) {
  const arr = str.trim().split(' ');
  return arr.indexOf(first.toString()) < arr.indexOf(second.toString());
}

async function getUnavailableSeats(trainCode, fromStationID, toStationID,doj) {
  const query = `
    WITH A AS (
      SELECT STRING_TO_ARRAY(R.ORDER_OF_STATIONS, ' ') AS STATION_ORDER
      FROM TRAIN T
      JOIN ROUTE R ON T.ROUTE_ID = R.ROUTE_ID
      WHERE T.TRAIN_CODE = $1
    )
    SELECT B.CLASS_CODE, B.SEAT_NUMBER
    FROM (
      SELECT CLASS_CODE, SEAT_NUMBER, FROM_STATION, TO_STATION
      FROM SEAT_RESERVATION
      WHERE TRAIN_CODE = $1 AND DATE=$4
    ) B, A
    WHERE 
      (
        ARRAY_POSITION(A.STATION_ORDER, B.FROM_STATION) <= ARRAY_POSITION(A.STATION_ORDER, $2)
        AND ARRAY_POSITION(A.STATION_ORDER, $2) <= ARRAY_POSITION(A.STATION_ORDER, B.TO_STATION)
      )
      OR
      (
        ARRAY_POSITION(A.STATION_ORDER, $2) <= ARRAY_POSITION(A.STATION_ORDER, B.FROM_STATION)
        AND ARRAY_POSITION(A.STATION_ORDER, B.FROM_STATION) <= ARRAY_POSITION(A.STATION_ORDER, $3)
      );
  `;
  const { rows } = await client.query(query, [
    trainCode,
    String(fromStationID),
    String(toStationID),
    String(doj)
  ]);
  return rows;
}

router.post('/', async (req, res) => {
  const { fromcity, tocity, doj } = req.body;
  if (!fromcity || !tocity || !doj) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const stationRes = await client.query(
      `SELECT station_id, station_name FROM station WHERE station_name = $1 OR station_name = $2;`, //GETTING THE STATION_ID
      [fromcity, tocity]
    );
    if (stationRes.rows.length < 2) {
      return res.status(404).json({ error: 'One or both stations not found.' });
    }

    const stationMap = {};
    stationRes.rows.forEach(r => (stationMap[r.station_name] = r.station_id));
    const fromStationId = stationMap[fromcity];
    const toStationId = stationMap[tocity];

    const routesResult = await client.query( //ALL POSSIBLE ROOT OF THE INTERSECTION OF THE STATION_ID'S
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
    ); //CHECKER FUNCTION OF (DHAKA-CHATTOGRAM NAKI CHATTOGRAM-DHAKA)

    const allTrains = [];
    for (const route of filteredRoutes) {
      const trainRes = await client.query(
        `SELECT TRAIN_CODE, NAME FROM TRAIN WHERE ROUTE_ID = $1;`,
        [route.route_id]
      );
      allTrains.push(...trainRes.rows);
    }

    const classRes = await client.query( //AVAILABLE CLASS PER TRAIN; AVAILABLE SEAT PER CLASS OF EACH TRAIN
      `SELECT A.CLASS_CODE, B.CLASS_NAME, A.TOTAL_SEAT
       FROM SEAT A JOIN CLASS B ON (A.CLASS_CODE = B.CLASS_CODE);`
    );

    const classMap = {};
    const classTotalMap = {};
    classRes.rows.forEach(r => {
      classMap[r.class_code] = r.class_name;
      classTotalMap[r.class_code] = r.total_seat;
    });
    const allClassCodes = Object.keys(classMap);

    const trainResult = [];

    for (const train of allTrains) {
      const trainCode = train.train_code;
      const trainName = train.name;

      const unavailableSeats = await getUnavailableSeats(
        trainCode,
        fromStationId,
        toStationId,
        doj
      );

      const grouped = {}; //UNAVAILABLE SEAT COUNT
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

      trainResult.push({
        train_code: trainCode,
        train_name: trainName,
        classes: classList,
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
