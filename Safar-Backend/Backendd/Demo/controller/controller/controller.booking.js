const express = require('express');
const app = express();

const search=require('../routes/booking/booking.search.js');
const reserve=require('../routes/booking/booking.reserve.js');
const geTicket=require('../routes/booking/booking.geTicket.js');

app.use('/search',search);
app.use('/reserve',reserve);
app.use('/getTicket',geTicket);

module.exports=app;