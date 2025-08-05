const server=require('../controller/controller.main.js');

//const createWebSocketServer = require('../controller/controller.socket.js');
//const wss = WebSocket.createWebSocketServer(server);


server.listen(5000,()=>{
});

module.exports=server;