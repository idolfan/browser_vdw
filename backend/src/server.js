const WebSocket = require('ws');

const clients = new Set();
let wss;

function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
        
            client.send(message);
        }
    });
}


function startServer() {
wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected.');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log(`Client says: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        clients.delete(ws);
    });
});


console.log('WebSocket server is running on ws://localhost:8080');

}

module.exports = { startServer, broadcast, clients };