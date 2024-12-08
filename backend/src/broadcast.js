function broadcast(message) {
    require('./server').clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function getClients() {
    return clients;
}

module.exports = { broadcast, getClients };