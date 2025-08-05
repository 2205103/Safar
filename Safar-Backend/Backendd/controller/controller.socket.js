const WebSocket = require('ws');

function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  // When a new client connects
  wss.on('connection', (ws) => {
    console.log('Client connected');

    // When a message is received from a client
    ws.on('message', (message) => {
      console.log('Received:', message);

      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message); // Forward to everyone except the sender
        }
      });
    });

    // Optional: when client disconnects
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
}

module.exports = createWebSocketServer;
