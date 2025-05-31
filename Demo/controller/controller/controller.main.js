const express = require('express');
const morgan=require('morgan');
const app = express();
app.use(morgan("dev"));
app.use(express.json());


const userController=require('./controller.user.js');
const bookingController=require('./controller.booking.js');

app.get('/',(req,res)=>{
    res.send("Specify");
})
app.use('/user',userController);
app.use('/booking',bookingController);
module.exports=app;