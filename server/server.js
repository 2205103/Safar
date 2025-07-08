require("dotenv").config();
const authorization = require("./middleware/authorize");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwtGenerator = require("./utils/jwtGenerator");
const bcrypt = require('bcryptjs');
const { Brush } = require("@mui/icons-material");
const { format } = require("morgan");
const app = express();
app.use(express.json());
app.use(cors());



app.get("/admin/trains", async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM train ORDER BY train_id');
    const trainsData = results.rows;

    for (const train of trainsData) {
      const trainId = train.train_id;

      // Fetch class data for the train
      const classesResult = await db.query(`
        SELECT class_id, (SELECT class_name FROM class WHERE class_id = tc.class_id) AS class_name, seat_count 
        FROM train_class tc WHERE train_id = $1 ORDER BY class_id
      `, [trainId]);
      train.trainClass = classesResult.rows.map(classRow => ({
        class: classRow.class_name,
        seats: classRow.seat_count
      }));

      // Fetch route data for the train
      const routeResults = await db.query(`
        SELECT route_id, (SELECT route_name FROM route WHERE route_id = tr.route_id) AS route_name 
        FROM train_routes tr WHERE train_id = $1
      `, [trainId]);

      train.trainRoutes = [];
      for (const routeRow of routeResults.rows) {
        const stationsResult = await db.query('SELECT * FROM get_station_sequence($1)', [routeRow.route_id]);
        let stationNames = stationsResult.rows.map(row => row.station_name);
        train.trainRoutes.push({
          route: routeRow.route_name,
          stations: stationNames
        });
      }

      // Fetch the ticket count for the train
      const ticketCountResult = await db.query(`
        SELECT COUNT(ticket.ticket_id) AS tickets_booked
        FROM ticket
        JOIN seat ON ticket.seat_id = seat.seat_id
        WHERE seat.train_id = $1
      `, [trainId]);
      train.ticketsBooked = parseInt(ticketCountResult.rows[0].tickets_booked, 10);
    }

    res.status(200).json({
      status: "success",
      data: {
        trains: trainsData
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.post('/admin/addTrain/confirm', async (req, res) => {
  console.log("Heloooooooo");
  try {
    const {
      trainId,
      trainName,
      routeId,
      routeName,
      stationData,
      classData
    } = req.body;

    console.log("route id : " + routeId);
    console.log("class Data : " + JSON.stringify(classData));
    console.log("station Data : " + JSON.stringify(stationData));
    console.log("train id : " + trainId);
    console.log("train name : " + trainName);


    const result = await db.query('CALL add_train($1, $2, $3)', [trainId, trainName, routeId]);

    let class_ids = [];
    let station_ids = [];
    let station_arrival = [];
    let station_departure = [];
    let seat_cnt = [];

    for (const station of stationData) {
      const { name, arrival, departure } = station;
      const stationId = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [name.toUpperCase()]);
      station_ids.push(stationId.rows[0].station_id);
      station_arrival[stationId.rows[0].station_id] = arrival;
      station_departure[stationId.rows[0].station_id] = departure;
    }

    const filteredStationData1 = station_arrival.filter(value => value !== null);
    const filteredStationData2 = station_departure.filter(value => value !== null);
    station_arrival = filteredStationData1;
    station_departure = filteredStationData2;

    for (const classItem of classData) {
      const { name, price, seats } = classItem;
      const result = await db.query('SELECT class_id FROM class WHERE UPPER(class_name) = $1', [name.toUpperCase()]);
      console.log(result.rows);
      class_ids.push(result.rows[0].class_id);
      seat_cnt.push(seats);
    }
    console.log("=============")
    console.log("class ids : " + class_ids);
    console.log(JSON.stringify(station_ids));
    console.log(JSON.stringify(class_ids));
    console.log(JSON.stringify(station_arrival));
    console.log(JSON.stringify(station_departure));
    console.log(JSON.stringify(seat_cnt))
    console.log('iftti')
    console.log(typeof (station_ids[0]))
    const result2 = await db.query('CALL add_route_train($1, $2, $3, $4)', [trainId, trainName, routeId, routeName]);
    const result3 = await db.query('CALL insert_class_schedule($1, $2, $3, $4, $5, $6, $7, $8)', [trainId, trainName, routeId, station_ids, class_ids, station_arrival, station_departure, seat_cnt]);
    const result4 = await db.query('CALL populate_seat_availability_new($1)', [trainId]);
    res.status(200).json({
      status: "success",
      data: {
        result: result.rows, // add_train
        result2: result2.rows, // add_route_train
        result3: result3.rows // insert_class_schedule
      },
    });
  }


  catch (error) {
    console.error(error);
  }

});

app.get("/admin/addTrain/:trainId/:trainName/:routeId/:number_of_stations/:number_of_classes", async (req, res) => {
  try {
    console.log("here");
    const { trainId, trainName, routeId, number_of_stations, number_of_classes } = req.params;
    console.log(trainId, trainName, routeId, number_of_stations, number_of_classes);
    const results = await db.query('call add_train($1, $2, $3)', [trainId, trainName, routeId]);
    const route_exists = `select * from route where route_id = $1`;
    const route_exists_res = await db.query(route_exists, [routeId]);
    const exist = route_exists_res.rows.length;
    const routesStations = await db.query('SELECT * FROM get_station_sequence($1)', [routeId]);
    const stations = routesStations.rows;
    const allStations = await db.query('SELECT station_name FROM station order by station_name')
    const allClasses = await db.query('SELECT class_name FROM class order by class_name')

    const mappedStations = stations.map(station => ({
      [station.sequence_number]: station.station_name
    }));

    const mappedClasses = allClasses.rows.map(class_name => class_name.class_name);

    const stationNames = allStations.rows.map(station => station.station_name);
    console.log("stations : " + JSON.stringify(stationNames));

    console.log("-----------")
    res.status(200).json({
      status: "success",
      result: results.rows.length,
      stations: mappedStations,
      allStations: stationNames,
      allClasses: mappedClasses,
      data: {
        trains: results.rows,
        exist: exist,

      },
    });


  } catch (err) {
    console.log(err);
    console.log(err.message);
    if (err.code === 'XX010') {
      res.status(500).json({
        status: "error",
        message: "Train already runs on that route",
      });
    }
    else if (err.code === 'XX011') {
      res.status(500).json({
        status: "error",
        message: "Duplicate Train Name not allowed",
      });
    }
    else if (err.code === 'XX012') {
      res.status(500).json({
        status: "error",
        message: "Train already runs on that route",
      });
    }
    else if (err.code === 'XX013') {
      res.status(500).json({
        status: "error",
        message: "Train ID and Train Name don't match",
      });
    }
  }
});

app.delete('/transaction/delete/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const routeRes = await db.query(`SELECT r.route_id FROM ticket t JOIN seat s ON t.seat_id = s.seat_id JOIN route r ON s.route_id = r.route_id
    WHERE t.transaction_id = $1`, [transactionId]);
    const routeid = routeRes.rows[0].route_id;
    console.log("route id : " + routeid);

    const b_st = await db.query(`SELECT t.boarding_station_id, t.destination_station_id
    FROM ticket t JOIN transaction tr ON t.transaction_id = tr.transaction_id
    WHERE tr.transaction_id = $1`, [transactionId]);
    const b_station_id = b_st.rows[0].boarding_station_id;
    const d_station_id = b_st.rows[0].destination_station_id;
    console.log("boarding station id : " + b_station_id);
    console.log("destination station id : " + d_station_id);


    const seq = await db.query(`SELECT station_id FROM get_station_sequence($1)`, [routeid]);
    const station_ids = seq.rows.map(row => row.station_id);
    console.log("station ids : " + station_ids);

    const boardingIndex = station_ids.indexOf(b_station_id);
    const destinationIndex = station_ids.indexOf(d_station_id);
    const filteredStationIds = station_ids.slice(boardingIndex, destinationIndex + 1);
    console.log("Filtered station ids : " + filteredStationIds);

    const res2 = await db.query(`SELECT * FROM ticket WHERE transaction_id = $1`, [transactionId]);  
    const date_j = res2.rows[0].date_of_journey;

    for (const ticket of res2.rows) {
      const seat_id = ticket.seat_id;
      for(const station_id of filteredStationIds){
        const res = await db.query(`UPDATE seat_availability SET available = TRUE WHERE seat_id = $1 AND travel_date = $2 AND station_id = $3`, [seat_id, date_j, station_id]);
      }

    }

    // const res1 = await db.query(`UPDATE seat_availability SET available = TRUE WHERE seat_id IN (SELECT seat_id FROM ticket WHERE transaction_id = $1)`, [transactionId]);
    const result = await db.query(`DELETE FROM transaction WHERE transaction_id = $1`, [transactionId]);
    console.log("deleted lmao");
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the transaction' });
  }

})

app.delete('/users/:userId/delete', async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    var hashedPassword = await bcrypt.hash(password, salt);
    const user = await db.query("SELECT password FROM passenger WHERE user_id = $1", [userId]);
    const userData = user.rows[0];
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});



app.post('/transaction/refund/:userId/:transactionId', async (req, res) => {
  try {
    console.log("|||||||||||||||||||||||| in refund|||||")
    const { userId, transactionId } = req.params;
    console.log("t id  " + transactionId)
    const result = await db.query(`SELECT * FROM transaction WHERE user_id = $1 AND transaction_id = $2`, [userId, transactionId])
    const refund = await db.query(`CALL refund_tickets($1, $2)`, [userId, transactionId]);
    console.log("refund done");
    res.status(200).json({ message: 'Refund successful' });
  }
  catch (err) {
    console.log(err.message);
    if (err.code === 'XX010') {
      // console.log(err.message);
      return res.status(400).json({ message: "Refund is not allowed the day before journey" });
    }
  }

});


app.post('/transaction/:id/:transactionId/:oldTransactionId/:transMode', async (req, res) => {
  try {
    console.log(req.params.id);
    console.log(req.params.transactionId);
    console.log(req.params.oldTransactionId);
    console.log(req.params.transMode);
    const oldTransactionId = req.params.oldTransactionId;

    let t_id = req.params.transactionId;
    if (t_id === '' || t_id === 'null') {

      return res.status(400).json({
        status: "error",
        message: "Transaction ID cannot be empty",
      });
    }
    const transMode = req.params.transMode;


    const result = await db.query(`SELECT * FROM transaction where transaction_id = $1`, [oldTransactionId]);
    console.log(result.rows[0]);
    const offerId = result.rows[0].offer_id;
    const totalFare = result.rows[0].amount;
    console.log(offerId);
    console.log(totalFare);
    let mode = result.rows[0].mode_of_transaction;
    console.log("type : " + typeof mode);
    if (mode === '' || mode === 'not paid' || mode === 'null') {
      mode = transMode;
    }


    const res2 = await db.query(`SELECT * FROM insert_transaction($1, $2, $3, $4, $5)`, [req.params.transactionId, mode, offerId, totalFare, req.params.id]);

    const updateTicket = await db.query(`UPDATE ticket SET transaction_id = $1, ticket_status = 'confirmed' WHERE user_id = $2 AND transaction_id = $3`, [req.params.transactionId, req.params.id, req.params.oldTransactionId]);

    const del = await db.query(`DELETE FROM transaction where transaction_id = $1`, [req.params.oldTransactionId]);
    ;
    res.status(200).json({
      status: "success",
      data: {
        ticket: updateTicket.rows,
      },
    });
  }
  catch (err) {
    console.log(err.message);
    if (err.code === 'XX001') {
      return res.status(400).json({ error: "transaction id already in use" });

    }
  }
});


app.get("/users/:id/tickets", async (req, res) => {
  try {


    
    const cancel_tickets = await db.query(`CALL update_ticket_status($1)`, [req.params.id]);


    const userId = req.params.id;
    const seats_map = {};
    const results = await db.query('SELECT * FROM ticket WHERE user_id = $1', [userId]);
    console.log(userId);
    for (const ticket of results.rows) {
      const seat = await db.query('SELECT seat_number FROM seat WHERE seat_id = $1', [ticket.seat_id]);
      seats_map[ticket.ticket_id] = seat.rows[0].seat_number;
    }


    const ticket_time_map = {};
    const ticket_trans_map = {};
    for (const ticket of results.rows) {
      const st_id = await db.query(`SELECT station_id from boarding_station where b_station_id = $1`, [ticket.boarding_station_id]);
      const time = await db.query(`SELECT * from schedule sc JOIN seat s ON sc.train_id = s.train_id AND sc.route_id = s.route_id
      WHERE s.seat_id = $1 and sc.station_id = $2;`, [ticket.seat_id, st_id.rows[0].station_id]);

      const transactionRes = await db.query('SELECT * FROM transaction JOIN ticket ON transaction.transaction_id = ticket.transaction_id WHERE ticket.ticket_id = $1', [ticket.ticket_id]);

      ticket_time_map[ticket.ticket_id] = time.rows[0].departure;
      ticket_trans_map[ticket.ticket_id] = transactionRes.rows[0].mode_of_transaction;
    }

    const tr = await db.query('SELECT distinct(transaction_id) FROM ticket WHERE user_id = $1', [userId]);

    const transactionJourneyMap = {};
    const arr = tr.rows.map(row => row.transaction_id);

    for (const t of arr) {
      const seatIDs = await db.query('SELECT seat_id, boarding_station_id, destination_station_id, ticket_status, date_of_journey FROM ticket where transaction_id = $1', [t]);
      const seat_id_temp = seatIDs.rows[0].seat_id;
      const desSt = seatIDs.rows[0].destination_station_id;
      const boardSt = seatIDs.rows[0].boarding_station_id;
      const tstatus = seatIDs.rows[0].ticket_status;
      const d_o_j = seatIDs.rows[0].date_of_journey;





      const seat = await db.query('SELECT train_id, class_id FROM seat WHERE seat_id = $1', [seat_id_temp]);

      const trainName = await db.query('SELECT train_name, train_id from train WHERE train_id = $1', [seat.rows[0].train_id]);
      const className = await db.query('SELECT class_name, class_id from class WHERE class_id = $1', [seat.rows[0].class_id]);


      const fromRes = await db.query('SELECT station_name from station JOIN boarding_station ON station.station_id = boarding_station.station_id WHERE boarding_station.b_station_id = $1', [boardSt]);
      const toRes = await db.query('SELECT station_name from station JOIN boarding_station ON station.station_id = boarding_station.station_id WHERE boarding_station.b_station_id = $1', [desSt]);
      const from = fromRes.rows[0].station_name;
      const to = toRes.rows[0].station_name;

      function formatDate1(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
      }


      // const res1 = await db.query('SELECT * FROM transaction JOIN ticket ON transaction.transaction_id = ticket.transaction_id WHERE ticket.ticket_id = $1', 
      // let r_flag = 0;
      const query = 'SELECT * from review where user_id = $1 and train_id = $2 and class_id = $3';
      const r_check = await db.query(query, [userId, trainName.rows[0].train_id, className.rows[0].class_id]);
      // console.log("====");
      // console.log(userId + " " + trainName.rows[0].train_id + " " + className.rows[0].class_id);

      // console.log(r_check.rows.length);
      let r_flag = r_check.rows.length;

      const dateOfJourney = formatDate1(d_o_j);

      const currentDate = formatDate1(new Date());

      // console.log(dateOfJourney < currentDate && r_check.rows.length === 0);
      if (dateOfJourney > currentDate) r_flag = -1;
      if (dateOfJourney < currentDate && r_check.rows.length === 0) {
        r_flag = 0;
      }

      // console.log(trainName.rows[0].train_id + " " + className.rows[0].class_id + " " );
      // console.log("review flag : " + r_flag);
      // console.log("====");

      transactionJourneyMap[t] = { train_id: trainName.rows[0].train_id, class_id: className.rows[0].class_id, trainName: trainName.rows[0].train_name, className: className.rows[0].class_name, from: from, to: to, doj: d_o_j, status: tstatus, reviewBool: r_flag };
    }



    res.status(200).json({
      status: "success",
      data: {
        tickets: results.rows,
        map: seats_map,
        time: ticket_time_map,
        transMode: ticket_trans_map,
        journeyMap: transactionJourneyMap
      },
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/booking/confirm", async (req, res) => {
  try {
    const { date,
      selectedSeats,
      totalFare,
      selectedStation,
      selectedStation_d,
      selectedOffer,
      discountedFare,
      transactionId,
      userId,
      className,
      trainName,
      route,
      transMode } = req.body;

    const selectedSeatsArray = [...selectedSeats];
    console.log(selectedSeats);
    console.log(route);

    const cnt = selectedSeatsArray.length;


    const price = totalFare / cnt;

    const result1 = await db.query(`SELECT B_STATION_ID FROM BOARDING_STATION WHERE B_STATION_NAME = $1`, [selectedStation]);
    const result2 = await db.query(`SELECT B_STATION_ID FROM BOARDING_STATION WHERE B_STATION_NAME = $1`, [selectedStation_d]);
    const b_station_id = result1.rows[0].b_station_id;
    const d_station_id = result2.rows[0].b_station_id;


    const result4 = await db.query(`SELECT train_id FROM train WHERE train_name = $1 `, [trainName]);
    const train_id = result4.rows[0].train_id;
    const result5 = await db.query(`SELECT class_id FROM class WHERE class_name = $1 `, [className]);
    const class_id = result5.rows[0].class_id;

    const result = await db.query('SELECT * FROM get_station_sequence($1)', [route]);

    const stationIds = result.rows.map(row => row.station_id);

    const startStation = await db.query('SELECT station_id FROM boarding_station WHERE B_STATION_NAME = $1', [selectedStation]);
    const endStation = await db.query('SELECT station_id FROM boarding_station WHERE B_STATION_NAME = $1', [selectedStation_d]);

    const startIndex = stationIds.indexOf(startStation.rows[0].station_id);

    const endIndex = stationIds.indexOf(endStation.rows[0].station_id);


    const stations = stationIds.slice(startIndex, endIndex + 1);

    const offerRes = await db.query('SELECT * FROM offer WHERE offer_id = $1', [selectedOffer]);
    const offer_id = offerRes.rows[0].offer_id;

    let t_m = transMode;
    let t_id = transactionId;
    if (transactionId === '') {
      t_id = null;
      t_m = '';
    }
    const resTransaction = await db.query('SELECT * FROM insert_transaction($1, $2, $3, $4, $5)', [t_id, t_m, offer_id, totalFare, userId]);

    const transactionId2 = resTransaction.rows[0].transaction_id;

    for (const seat of selectedSeatsArray) {


      const result3 = await db.query(`SELECT SEAT_ID FROM SEAT WHERE SEAT_NUMBER = $1 AND route_id= $2 AND TRAIN_ID= $3 AND CLASS_ID=$4`, [seat.toString(), route, train_id, class_id]);
      const seat_id_n = result3.rows[0].seat_id;


      const result = await db.query('SELECT * from insert_ticket($1, $2, $3, $4, $5, $6, $7, $8, $9)', [userId, b_station_id, d_station_id, price, transactionId2, seat_id_n, route, date, stations]);

    }
    res.status(200).json({
      status: "success",
      data: {

      }
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === 'XX001') {
      return res.status(400).json({ error: "transaction id already in use" });
    }
  }

});


app.get("/is-verify", authorization, async (req, res) => {
  try {

    console.log("aurthorization successful");
    res.json(true);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});


// ticket
app.get("/booking/ticket", async (req, res) => {
  try {
    const { trainName, className, routeName, date, from, to, selectedSeats, totalFare, boarding, destination } = req.query;
    const seatsArray = selectedSeats.split(',').map(seat => seat.trim());

    const offers = await db.query(`SELECT * FROM get_eligible_offers($1)`, [seatsArray.length])

    res.status(200).json({
      status: "success",
      data: {
        train_name: trainName,
        class_name: className,
        route_name: routeName,
        date: date,
        from: from,
        to: to,
        selected_seats: seatsArray,
        total_fare: totalFare,
        boarding_station: boarding,
        destination_station: destination,
        offers: offers.rows
      },

    });
  } catch (error) {
    console.error(error.message);
  }
});



// book a seat
app.get('/booking/seat', async (req, res) => {
  try {
    const { trainId, classId, routeId, date, from, to } = req.query;

    const dateReceived = new Date(date);
    const year = dateReceived.getFullYear();
    const month = String(dateReceived.getMonth() + 1).padStart(2, '0');
    const day = String(dateReceived.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const queryFrom = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`

    const queryTo = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`


    const fromStation = await db.query(queryFrom, [from]);
    const toStation = await db.query(queryTo, [to]);

    const r1 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [from.toUpperCase()]);
    const r2 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [to.toUpperCase()]);

    const fromStationId = parseInt(r1.rows[0].station_id);
    const toStationId = parseInt(r2.rows[0].station_id);

    const RouteNameQuery = `SELECT route_name FROM route WHERE route_id = $1`;
    const resultRouteName = await db.query(RouteNameQuery, [routeId]);
    const routeName = resultRouteName.rows[0].route_name;


    const query3 = `SELECT * FROM get_station_sequence($1);`


    const resultForStations = await db.query(query3, [routeId]);

    const stations = resultForStations.rows;

    const queryForFare = `SELECT 
        f.fare, t.train_name, c.class_name
    FROM 
        train t
    JOIN 
        train_class tc ON t.train_id = tc.train_id
    JOIN 
        class c ON tc.class_id = c.class_id
    JOIN 
        fareList f ON c.class_id = f.class_id
    WHERE 
        t.train_id = $1
        AND tc.class_id = $2
     `;

    const resultFare = await db.query(queryForFare, [trainId, classId]);
    console.log("resultFare : " + resultFare.rows[0].fare);
    const sendFare = resultFare.rows[0].fare;
    const trainName = resultFare.rows[0].train_name;
    const className = resultFare.rows[0].class_name;
    console.log("train name : " + trainName);
    console.log("class name : " + className);



    const queryForAvailableSeats = `
    SELECT CAST(seat_number AS INTEGER) AS seat_number
    FROM (
        SELECT s.seat_number
        FROM seat_availability sa
        JOIN seat s ON sa.seat_id = s.seat_id
        WHERE s.train_id = $1
        AND s.class_id = $2
        AND s.route_id = $3
        AND sa.travel_date = $4
        AND sa.station_id = ANY($5)
        AND sa.available = TRUE
        GROUP BY s.seat_number
        HAVING COUNT(DISTINCT sa.station_id) = $6
    ) AS seats
    ORDER BY CAST(seat_number AS INTEGER);
     `;
    const result = await db.query(queryForAvailableSeats, [trainId, classId, routeId, formattedDate, stations.map(s => s.station_id), stations.length]);

    const availableSeats = [];
    for (const r of result.rows) {
      availableSeats.push(r.seat_number);
    }

    console.log(availableSeats);

    const queryForTotalSeats = `
      SELECT seat_count FROM train_class WHERE train_id = $1 AND class_id = $2;
      `;
    const result3 = await db.query(queryForTotalSeats, [trainId, classId]);
    const total_seat = result3.rows[0].seat_count;

    const b_station = await db.query('SELECT b_station_name FROM BOARDING_STATION WHERE STATION_ID = $1', [fromStationId]);


    const d_station = await db.query('SELECT b_station_name FROM BOARDING_STATION WHERE STATION_ID = $1', [toStationId]);




    res.status(200).json({
      status: "success",
      data: {
        available_seats_count: result.rows.length,
        available_seats: availableSeats,
        total_seats: total_seat,
        fare: sendFare,
        train_name: trainName,
        class_name: className,
        route_name: routeName,
        b_station: b_station.rows,
        d_station: d_station.rows
      }
    });
  }
  catch (err) {
    console.log(err);
  }

});


app.post("/send/review/:id/:trainName/:className", async (req, res) => {
  try {
    console.log("here");
    const { id, trainName, className } = req.params;
    const { review, rating } = req.body;
    console.log(review + " " + rating);
    const result = await db.query(`INSERT INTO review (user_id, train_id, class_id, review_content, rating)
    VALUES ($1, (SELECT train_id FROM train WHERE train_name = $2), (SELECT class_id FROM class WHERE class_name = $3), $4, $5)`,
      [id, trainName, className, review, rating]);
  } catch (err) {
    console.log(err);
  }

});


// review
app.get("/review", async (req, res) => {
  try {
    const trainID = req.query.trainID;
    const classType = req.query.classType;
    const results = await db.query('SELECT p.user_id, p.first_name, p.last_name, r.review_content, r.rating FROM review r join passenger p on (r.user_id= p.user_id) WHERE r.train_id = $1 AND r.class_id = $2', [trainID, classType]);
    res.status(200).json({
      status: "success",
      result: results.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

// /// suggestive search train
app.get("/book/station/search", async (req, res) => {
  try {
    const st = req.query.name;
    console.log(st);
    const results = await db.query(
      'SELECT station_name FROM station WHERE LOWER(station_name) LIKE LOWER($1)',
      [`%${st.toLowerCase()}%`]
    );

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


///train search booking

app.get("/book/search", async (req, res) => {
  try {
    const fromS = req.query.from;
    const toS = req.query.to;
    const dateString = req.query.date;


    const dateReceived = new Date(dateString);

    const year = dateReceived.getFullYear();
    const month = String(dateReceived.getMonth() + 1).padStart(2, '0');
    const day = String(dateReceived.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const populate = await db.query('Call populate_seat_availability()');
    const queryFrom = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`

    const queryTo = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`


    const fromStation = await db.query(queryFrom, [fromS]); // finding the names of the FROM-TO stations
    const toStation = await db.query(queryTo, [toS]);

    const r1 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [fromS.toUpperCase()]);
    const r2 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [toS.toUpperCase()]);


    const fromStationId = parseInt(r1.rows[0].station_id);
    const toStationId = parseInt(r2.rows[0].station_id);



    const queryforTrain = (`
        SELECT DISTINCT t.train_id, t.train_name, tr.route_id
    FROM train t
    JOIN train_routes tr ON t.train_id = tr.train_id
    JOIN route_stations rs_from ON tr.route_id = rs_from.route_id
    JOIN route_stations rs_to ON tr.route_id = rs_to.route_id
    JOIN station s_from ON rs_from.station_id = s_from.station_id
    JOIN station s_to ON rs_to.station_id = s_to.station_id
    WHERE s_from.station_id = $1
    AND s_to.station_id = $2
    AND rs_from.sequence_number < rs_to.sequence_number;
        `);  // returns the unique train, route pairs

    const trainResults = await db.query(queryforTrain, [fromStationId, toStationId]);
    const trainIdsSet = new Set(trainResults.rows.map(row => row.train_id));
    const trainIdsArray = Array.from(trainIdsSet); // returns the unique train ids
    const trainIdsString = trainIdsArray.join(',');

    const routeIDSet = new Set(trainResults.rows.map(row => row.route_id));
    const distinctRouteIDs = Array.from(routeIDSet);  // returns the unique routes to exist

    const query2 = `SELECT 
        t.train_id, 
        t.train_name, 
        c.class_name,
        c.class_id,
        f.fare
    FROM 
        train t
    JOIN 
        train_class tc ON t.train_id = tc.train_id
    JOIN 
        class c ON tc.class_id = c.class_id
    JOIN 
        fareList f ON c.class_id = f.class_id
    WHERE 
        t.train_id IN (${trainIdsString})
        AND f.source = $1        
        AND f.destination = $2 
     `;// returns the fares of those trains to go from FROM to TO for each of their classes

    const trainFares = await db.query(query2, [fromStationId, toStationId]);

    const query3 = `SELECT * FROM get_station_sequence($1);`

    let routeStations = []; // This will hold routeIDs and their stations
    for (const routeID of distinctRouteIDs) {
      const result = await db.query(query3, [routeID]);
      routeStations.push({ routeID: routeID, results: result.rows });
    }
    //console.log("m1");

    const queryForAvailableSeats = `
    SELECT CAST(seat_number AS INTEGER) AS seat_number
    FROM (
        SELECT s.seat_number
        FROM seat_availability sa
        JOIN seat s ON sa.seat_id = s.seat_id
        WHERE s.train_id = $1
        AND s.class_id = $2
        AND s.route_id = $3
        AND sa.travel_date = $4
        AND sa.station_id = ANY($5)
        AND sa.available = TRUE
        GROUP BY s.seat_number
        HAVING COUNT(DISTINCT sa.station_id) = $6
    ) AS seats
    ORDER BY CAST(seat_number AS INTEGER);
     `;

    const queryForTotalSeats = `
      SELECT seat_count FROM train_class WHERE train_id = $1 AND class_id = $2;
      `;

    const result4 = [];



    for (const train of trainResults.rows) {  // train_id, train_name, route_id
      const t_id = train.train_id;
      const r_id = train.route_id;
      const t_name = train.train_name;
      const stations_in_route = routeStations.find(r => r.routeID === r_id).results; // holds the stations

      const classes = await db.query('SELECT class_id FROM train_class where train_id= $1', [t_id]);

      for (const c of classes.rows) {
        const class_id = c.class_id;
        const result2 = await db.query(queryForAvailableSeats, [t_id, class_id, r_id, formattedDate, stations_in_route.map(s => s.station_id), stations_in_route.length]);

        const availableSeats = [];
        for (const r of result2.rows) {
          availableSeats.push(r.seat_number);
        }

        const result3 = await db.query(queryForTotalSeats, [t_id, class_id]);

        result4.push({ train_id: t_id, route_id: r_id, class_id: class_id, available_seats_count: result2.rows.length, available_seats: availableSeats, total_seats: result3.rows[0].seat_count });
      }

    }

    console.log(result4);
    res.status(200).json({
      status: "success",
      data: {
        result: trainResults.rows,
        result2: trainFares.rows,
        from: fromStation.rows,
        to: toStation.rows,
        info: result4
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});






// Get all users
app.get("/users", async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM passenger ORDER BY user_id');

    res.status(200).json({
      status: "success",
      result: results.rows.length,
      data: {
        users: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// get all trains
app.get("/trains", async (req, res) => {
  try {

    const results = await db.query('SELECT * FROM train ORDER BY train_id');
    console.log(results.rows[0]);
    res.status(200).json({
      status: "success",
      result: results.rows.length,
      data: {
        trains: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//Get a train route
app.get("/trains/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const trainID = parseInt(req.params.id);

    const results = await db.query(`SELECT 
      tr.train_id,
      tr.train_name,
      r.route_id,
      r.route_name,
      rs.sequence_number,
      s.station_id,
      s.station_name,
      sch.arrival,
      sch.departure
  FROM 
      train_routes trr
  JOIN 
      train tr ON trr.train_id = tr.train_id
  JOIN 
      route r ON trr.route_id = r.route_id
  JOIN 
      route_stations rs ON r.route_id = rs.route_id
  JOIN 
      station s ON rs.station_id = s.station_id
  JOIN 
      Schedule sch ON tr.train_id = sch.train_id AND s.station_id = sch.station_id AND r.route_id = sch.route_id
  WHERE 
      tr.train_id = $1
  ORDER BY 
      tr.train_id, r.route_id, rs.sequence_number;
  `, [trainID]);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});



//Get a user
app.get("/users/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const userID = parseInt(req.params.id);
    const results = await db.query(
      'SELECT * FROM passenger WHERE user_id = $1',
      [userID]
    );

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});


// Create a user

app.post("/users", async (req, res) => {
  console.log(req.body);
  const { email, phone_number, password } = req.body;
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  try {
    // const phone_number = req.body.phone_number
    // const email = req.body.email;
    const { first_name, last_name, nid_number, birth_registration_number, phone_number, email, date_of_birth, password, gender } = req.body;
    console.log(first_name + " " + last_name + " " + nid_number + " " + birth_registration_number + " " + phone_number + " " + email + " " + date_of_birth + " " + password + " " + gender);
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const results = await db.query(
      'INSERT INTO passenger (first_name,last_name,nid_number,birth_registration_number,phone_number,email,date_of_birth,password,gender) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [first_name, last_name, nid_number, birth_registration_number, phone_number, email, date_of_birth, hashedPassword, gender]);


    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(results.rows[0].user_id);
    return res.status(201).json({
      status: "success",
      data: {
        status: "Account created successfully",
        userID: results.rows[0].user_id,
        jwtToken: jwtToken
      }
    });

  } catch (err) {
    console.log(err);
    if (err.code === 'XX001') {
      return res.status(400).json({ error: "NID already in use" });
    }
    else if (err.code === 'XX002') {
      return res.status(400).json({ error: "Birth Registration Number already in use" });
    }
    else if (err.code === 'XX003') {
      return res.status(400).json({ error: "NID or Birth Registration Number must be provided" });
    }
    else if (err.code === 'XX004') {
      return res.status(400).json({ error: "Invalid phone Number" });
    }
    else if (err.code === 'XX005') {
      return res.status(400).json({ error: "First Name and Last Name are required fields" });
    }
    else if (err.code === 'XX006') {
      return res.status(400).json({ error: "Invalid date of Birth" });
    }
    else if (err.code === 'XX007') {
      return res.status(400).json({ error: "Email already in use. Please provide a new email" });
    }
    else if (err.code === 'XX008') {
      return res.status(400).json({ error: "Email is a required field" });
    }
    else {
      console.log("unknown error");
      return res.status(401).json({ error: err.message });
    }
  }
});


// Update user


app.put("/users/:id/update", async (req, res) => {

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    var hashedPassword = await bcrypt.hash(req.body.new_password, salt);

    const user = await db.query("SELECT * FROM passenger WHERE user_id = $1", [req.params.id]);


    const userData = user.rows[0];
    // const isOldPasswordValid = await bcrypt.compare(req.body.password, userData.password);


    if (req.body.new_password === '') {
      hashedPassword = userData.password;
    }

    console.log(req.body.address + " ---" + req.body.post_code + "+++----- " + req.body.phone_number + " " + hashedPassword + " " + req.body.birth_registration_number + " " + req.params.id)

    const results = await db.query(
      'UPDATE passenger SET address = $1, post_code = $2, phone_number = $3, password = $4, birth_registration_number = $5 WHERE user_id = $6 returning *',
      [
        req.body.address,
        req.body.post_code,
        req.body.phone_number,
        hashedPassword,
        req.body.birth_registration_number,
        req.params.id
      ]
    );

    console.log(results);
    console.log("updated");
    res.status(200).json({
      status: "success",
      data: {
        user: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.code);
    console.error(err);
    if (err.code === 'XX004') {
      return res.status(400).json({ error: "Invalid phone Number" });
    }
    else if (err.code === 'XX009') {
      return res.status(400).json({ error: "Incorrect Password" });
    }
  }
});


// Delete user

app.delete("/users/:id", async (req, res) => {
  try {
    console.log("deleting user " + req.params.id);
    const results = db.query('DELETE FROM passenger where user_id = $1', [
      req.params.id,
    ]);
    // console.log(results);
    res.status(204).json({
      status: "success",

    });
  } catch (err) {
    console.log(err);
  }
});



// Search train // dummy
app.get("/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        //names : firstNames 
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
// dummy end


//suggestive search train
app.get("/trains/name/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


// Search Train
app.get("/trains/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//login
app.post("/users/login", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM passenger WHERE email = $1", [req.body.email]);
    const isOldPasswordValid = await bcrypt.compare(req.body.password, results.rows[0].password);
    if (!isOldPasswordValid) {

      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("login successful");
    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(jwtToken);
    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        res: jwtToken
      },
      message: "Login Successful"
    });
  }
  catch (err) {
    console.error(err.message);
  }
});

const port = process.env.PORT || 3001;        //environ variable -> env // port env te pass na korle default value 3001
app.listen(port, () => {
  console.log(`server is up and listening on port ${port}`);
});
