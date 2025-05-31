const express = require('express');
const app = express();

const search=require('../routes/booking/booking.search.js');

app.use('/search',search);

module.exports=app;