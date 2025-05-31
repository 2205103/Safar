const express = require('express');
const app = express();

const trainRoute=require('../routes/user.train.js');
const routeRoute=require('../routes/user.route.js');
const stationRoute=require('../routes/user.station.js');

app.get('/',(req,res)=>{
    res.send("Name?");
})

app.use('/train',trainRoute);
app.use('/route',routeRoute);
app.use('/station',stationRoute);

app.use('/',(req,res)=>{
    res.send("404");
})

module.exports=app;