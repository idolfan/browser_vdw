const WebSocket = require('ws');

let socket;

function connect() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('Connected to server.');
        if(document.cookie) loginWithToken(document.cookie);
    };

    socket.onmessage = (event) => {
        handleReceiveMessage(event);
    };

    socket.onclose = () => {
        console.log('Disconnected from server.');
    };
}

function send(message) {
    socket.send(message);
}

function loginWithToken(token) {
    socket.send(JSON.stringify({ type: 'login', token }));
}

function loginWithCredentials(username, password) {
    socket.send(JSON.stringify({ type: 'login', username, password }));
    
}

function register(username, password) {
    socket.send(JSON.stringify({ type: 'register', username, password }));
}

function handleReceiveMessage(event) {
    const message = JSON.parse(event.data);

    if (message.type === 'loginWithToken') receiveLoginWithToken(message);
    else if (message.type === 'loginWithCredentials') receiveLoginWithCredentials(message);
    else if (message.type === 'register') receiveRegister(message);
}

function receiveLoginWithToken(message) {
    if (message.success) {
        if(window.location.pathname !== '/') window.location = '/';
    } else {
        window.location = '/login';
        document.cookie = '';
    }
}

function receiveLoginWithCredentials(message) {
    if (message.success) {
        if(window.location.pathname !== '/') window.location = '/';
        document.cookie = message.token;
    } else {
        alert('Invalid username or password');
    }
}

function receiveRegister(message) {
    if (message.success) {
        document.cookie = message.token;
    } else {
        alert(message.errorMessage);
    }
}

module.exports = { connect, send, loginWithToken, loginWithCredentials, register };