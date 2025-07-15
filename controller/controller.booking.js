const express = require('express');
const app = express();

const search=require('../routes/booking/booking.search.js');
const reserve=require('../routes/booking/booking.reserve.js');
const geTicket=require('../routes/booking/booking.geTicket.js');
const cancelTicket=require('../routes/booking/booking.cancelTicket.js');
const refund=require('../routes/booking/booking.refund.js');
const trainDetails=require('../routes/booking/booking.trainDetails.js');

app.use('/search',search);
app.use('/reserve',reserve);
app.use('/getTicket',geTicket);
app.use('/cancelTicket',cancelTicket);
app.use('/refund',refund);
app.use('/trainDetails',trainDetails);

module.exports=app;