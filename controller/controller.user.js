const express = require('express');
const app = express();

const register=require('../routes/user/user.register.js');
const login=require('../routes/user/user.login.js');
const userInfo=require('../routes/user/user.info.js');
const deleteAccount=require('../routes/user/user.deleteAccount.js');
const updatePassword=require('../routes/user/user.updatePassword.js');
// const geTicket=require('../routes/user/user.geTicket.js');


app.use('/info/delete',deleteAccount);
app.use('/info/update',updatePassword);
app.use('/register',register);
app.use('/login',login);
app.use('/info',userInfo);
// app.use('/getTicket',geTicket);

module.exports=app;