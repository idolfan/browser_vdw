var socket;
let redirectBackTo = "/";

function connect() {
    return new Promise((resolve, reject) => {
        console.log("Trying to connect to server...");
        socket = new WebSocket('ws://idolfan.ddns.net:9001');

        socket.onopen = () => {
            console.log('Connected to server.');
            if (document.cookie) loginWithToken(document.cookie);
            else {
                if (window.location.pathname !== '/login.html') window.location = '/login.html';
            }
            resolve();
        };

        socket.onmessage = (event) => {
            handleReceiveMessage(event);
        };

        socket.onclose = () => {
            console.log('Disconnected from server.');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };
    });
}

function send(message) {
    const fullMessage = { ...message };
    if (document.cookie) fullMessage.token = document.cookie;
    socket.send(JSON.stringify(fullMessage));
}

function loginWithToken(token) {
    send({ type: 'loginWithToken', token });
}

function loginWithCredentials(username, password) {
    send({ type: 'loginWithCredentials', username, password });

}

function register(username, password) {
    send({ type: 'register', username, password });
}

function handleReceiveMessage(event) {
    const message = JSON.parse(event.data);
    // console.log('Handle message:', message.type);
    if (message.type === 'loginWithToken') receiveLoginWithToken(message);
    else if (message.type === 'loginWithCredentials') receiveLoginWithCredentials(message);
    else if (message.type === 'register') receiveRegister(message);
    else if (message.type === 'gameData') receiveGameData(message);
    else if (message.type === 'getLevel') receiveGetLevel(message);
    else if (message.type === 'createGame') receiveCreateGame(message);
    else if (message.type === 'joinGame') receiveJoinGame(message);
    else console.log('Unknown message type:', message.type);
}

function receiveLoginWithToken(message) {
    if (message.success) {
        console.log('Login successful');
        //if (window.location.pathname !== '/lobby.html') window.location = '/lobby.html';
        if (window.location.pathname !== redirectBackTo) window.location = redirectBackTo;
    } else {
        console.log('Invalid token');
        if (window.location.pathname !== '/login.html') window.location = '/login.html';
        document.cookie = '';
    }
}

function receiveLoginWithCredentials(message) {
    if (message.success) {
        console.log('Login successful');
        document.cookie = message.token;
        if (window.location.pathname !== redirectBackTo) window.location = redirectBackTo;
    } else {
        alert('Invalid username or password');
    }
}

function receiveRegister(message) {
    if (message.success) {
        document.cookie = message.token;
        if (window.location.pathname !== redirectBackTo) window.location = redirectBackTo;
    } else {
        alert(message.errorMessage);
    }
}

//////////

function refreshDiscord() {
    send({ type: 'refreshDiscord' });
}

function linkDiscordToUser(discordId) {
    send({ type: 'linkDiscordToUser', discordId });
}

function changeGameSettings(settings) {
    console.log('Changing game settings..');
    send({ type: 'changeGameSettings', settings });
}

function createGame(settings) {
    console.log('Creating game..');
    send({ type: 'createGame', settings });
}

function joinGame(gameId) {
    console.log('Joining game..');
    send({ type: 'joinGame', gameId });
}

function logout() {
    document.cookie = '';
    send({ type: 'logout' });
    window.location = '/login.html';
}

function getLevel(levelId) {
    send({ type: 'getLevel', levelId });
}

function saveLevel() {
    send({ type: 'saveLevel', level });
}

function leaveGame() {
    send({ type: 'leaveGame' });
}

function receiveCreateGame(message) {
    if (!message.success) {
        alert('Failed to create game');
        return;
    }
    setGameLobbyVisible(message);
}

function startGame(settings) {
    send({ type: 'startGame', settings, gameSessionId });
}

//

function receiveJoinGame(message) {
    if (!message.success) {
        alert('Failed to join game');
        return;
    }
    setGameLobbyVisible(message);
}

function receiveGetLevel(message) {
    if (message.success) {
        console.log('Level received:', message.level);
        level = message.level;
        players = {};
        levelHistory = [];
        levelHistory.push(JSON.parse(JSON.stringify(level)));
    } else {
        console.log('Level not found');
    }
}

function receiveLeaveGame(message) {
    if (!message.success) {
        alert('Failed to leave game');
        return;
    }
    setLobbySelectionVisible(message);
}

