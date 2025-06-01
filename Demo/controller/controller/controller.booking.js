const express = require('express');
const app = express();

const search=require('../routes/booking/booking.search.js');
const reserve=require('../routes/booking/booking.reserve.js');

app.use('/search',search);
app.use('/reserve',reserve);

module.exports=app;