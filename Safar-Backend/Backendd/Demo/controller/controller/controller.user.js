const express = require('express');
const app = express();

const register=require('../routes/user/user.register.js');
const login=require('../routes/user/user.login.js');
// const geTicket=require('../routes/user/user.geTicket.js');

app.use('/register',register);
app.use('/login',login);
// app.use('/getTicket',geTicket);

module.exports=app;