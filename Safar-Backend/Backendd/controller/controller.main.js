const express = require('express');
const morgan=require('morgan');
const dotenv = require("dotenv");
const cors = require('cors');
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
dotenv.config();


const userController=require('./controller.user.js');
const bookingController=require('./controller.booking.js');
const socketController=require('./controller.socket.js');

app.get('/',(req,res)=>{
    res.send("Specify");
})
app.use('/user',userController);
app.use('/booking',bookingController);
app.use('/socket',socketController);
module.exports=app;