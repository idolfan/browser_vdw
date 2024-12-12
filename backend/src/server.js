const WebSocket = require('ws');
const { users, createUser, saveUser } = require('./users');
const { levels, movePlayer, players, addLevel } = require('./game');
const { loadLevel, saveLevel } = require('./level');
const { getMembers, members } = require('./discordBot');
const { gameSessions } = require('./game');

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
    wss = new WebSocket.Server({ port: 9001 });

    wss.on('connection', (ws) => {
        console.log('Client connected.');
        clients.add(ws);

        ws.on('message', (message) => {
            handleReceiveMessage(ws, JSON.parse(message));
        });

        ws.on('close', () => {
            console.log('Client disconnected.');
            clients.delete(ws);
        });
    });

    console.log('WebSocket server is running on ws://localhost:9001');

}

function sendDataAfterLogin(ws, user) {
    const isInGameSession = gameSessions.find(gameSession => gameSession.players.find(player => player.userId === user.id));
    if (isInGameSession) {
        ws.send(JSON.stringify({ type: 'joinGame', success: true, gameSessionId: gameSessions.indexOf(isInGameSession), players: isInGameSession.players, levels: Object.keys(levels) }));
        return;
    }

}

function handleReceiveMessage(ws, message) {
    //console.log('Handle message:', message.type);

    if (message.type === 'loginWithToken') receiveLoginWithToken(ws, message);
    else if (message.type === 'loginWithCredentials') receiveLoginWithCredentials(ws, message);
    else if (message.type === 'register') receiveRegister(ws, message);
    else if (message.type === 'movePlayer') receiveMovePlayer(ws, message);
    else if (message.type === 'getLevel') receiveGetLevel(ws, message);
    else if (message.type === 'saveLevel') receiveSaveLevel(ws, message);
    else if (message.type === 'createGame') receiveCreateGame(ws, message);
    else if (message.type === 'joinGame') receiveJoinGame(ws, message);
    else if (message.type === 'changeGameSettings') receiveChangeGameSettings(ws, message);
    else if (message.type === 'refreshDiscord') receiveRefreshDiscord(ws, message);
    else if (message.type === 'linkDiscordToUser') receiveLinkDiscordToUser(ws, message);
    else if (message.type === 'leaveGame') receiveLeaveGame(ws, message);
    else if(message.type === 'startGame') receiveStartGame(ws, message);
    else console.log('Unknown message type:', message.type);
}

function receiveStartGame(ws, message) {
    const gameSession = gameSessions[message.gameSessionId];
    if (!gameSession) {
        console.log('Game session not found');
        ws.send(JSON.stringify({ type: 'startGame', success: false, errorMessage: 'Game session not found' }));
        return;
    }
    const user = Object.values(users).find(user => user.token === message.token);
    if (!gameSession.players.find(player => player.userId === user.id)) {
        console.log('User not in game session');
        ws.send(JSON.stringify({ type: 'startGame', success: false, errorMessage: 'User not in game session' }));
        return;
    }
    if (!gameSession.players.find(player => { return player.userId === user.id && player.host })) {
        console.log('User not host');
        ws.send(JSON.stringify({ type: 'startGame', success: false, errorMessage: 'User not host' }));
        return;
    }
    broadcast(JSON.stringify({ type: 'startGame', success: true, gameSessionId: message.gameSessionId }));

    // TODO: Start game
}

function receiveLeaveGame(ws, message) {
    const user = Object.values(users).find(user => user.token === message.token);
    const gameSession = gameSessions.find(gameSession => gameSession.players.find(player => player.userId === user.id));
    if (!gameSession) {
        console.log('Game session not found');
        ws.send(JSON.stringify({ type: 'leaveGame', success: false, errorMessage: 'Game session not found' }));
        return;
    }
    gameSession.players = gameSession.players.filter(player => player.userId !== user.id);
    ws.send(JSON.stringify({ type: 'leaveGame', success: true }));
}


function receiveLinkDiscordToUser(ws, message) {
    const user = Object.values(users).find(user => user.token === message.token);
    if (!user) {
        console.log('User not found');
        ws.send(JSON.stringify({ type: 'linkDiscordToUser', success: false, errorMessage: 'User not found' }));
        return;
    }
    const member = members.find(member => member.id === message.discordId);
    if (!member) {
        console.log('Member not found');
        ws.send(JSON.stringify({ type: 'linkDiscordToUser', success: false, errorMessage: 'Member not found' }));
        return;
    }
    user.discordId = member.id;
    saveUser(user.id);
    ws.send(JSON.stringify({ type: 'linkDiscordToUser', success: true }));
}

function receiveRefreshDiscord(ws, message) {
    const allMembers = getMembers();
    ws.send(JSON.stringify({ type: 'refreshDiscord', members: allMembers }));
}

function receiveJoinGame(ws, message) {
    const user = Object.values(users).find(user => user.token === message.token);
    const gameSession = gameSessions[message.gameSessionId];
    if (!gameSession) {
        console.log('Game session not found');
        ws.send(JSON.stringify({ type: 'joinGame', success: false, errorMessage: 'Game session not found' }));
        return;
    }

    gameSession.players.push({ userId: user.id, x: 0, y: 0, name: user.username });
    ws.send(JSON.stringify({ type: 'joinGame', success: true, gameSessionId: message.gameSessionId, players: gameSession.players, levels: Object.keys(levels) }));
}

function receiveChangeGameSettings(ws, message) {
    const gameSession = gameSessions[message.gameSessionId];
    if (!gameSession) {
        console.log('Game session not found');
        ws.send(JSON.stringify({ type: 'changeGameSettings', success: false, errorMessage: 'Game session not found' }));
        return;
    }
    const user = Object.values(users).find(user => user.token === message.token);
    if (!gameSession.players.find(player => player.userId === user.id)) {
        console.log('User not in game session');
        ws.send(JSON.stringify({ type: 'changeGameSettings', success: false, errorMessage: 'User not in game session' }));
        return;
    }
    if (!gameSession.players.find(player => { return player.userId === user.id && player.host })) {
        console.log('User not host');
        ws.send(JSON.stringify({ type: 'changeGameSettings', success: false, errorMessage: 'User not host' }));
        return;
    }

    gameSession.settings = message.settings;
    ws.send(JSON.stringify({ type: 'changeGameSettings', success: true }));

}

function receiveCreateGame(ws, message) {
    
    const user = Object.values(users).find(user => user.token === message.token);
    gameSessions.push({ settings: {}, players: [{ userId: user.id, x: 0, y: 0, host: true, name: user.username }] });
    ws.send(JSON.stringify({ type: 'createGame', success: true, gameSessionId: gameSessions.length - 1, players: gameSessions[gameSessions.length - 1].players, levels: Object.keys(levels) }));
}

function receiveSaveLevel(ws, message) {
    const level = message.level;
    if (!level) {
        console.log('Invalid level');
        ws.send(JSON.stringify({ type: 'saveLevel', success: false, errorMessage: 'Invalid level' }));
    } else {
        addLevel(level.name, level);
        console.log('Saving level:', level.name);
        saveLevel(level.name, level);
        ws.send(JSON.stringify({ type: 'saveLevel', success: true }));
    }

}

function receiveGetLevel(ws, message) {
    let level = levels[message.levelId];
    if (!level) {
        level = loadLevel(message.levelId);
    }
    if (level) {
        ws.send(JSON.stringify({ type: 'getLevel', level, success: true }));
    } else {
        ws.send(JSON.stringify({ type: 'getLevel', success: false, errorMessage: 'Level not found' }));
    }
}

function receiveLoginWithToken(ws, message) {
    const user = Object.values(users).find(user => user.token === message.token);
    if (user) {
        ws.send(JSON.stringify({ type: 'loginWithToken', success: true, userId: user.userId }));
        sendDataAfterLogin(ws, user);
    } else {
        ws.send(JSON.stringify({ type: 'loginWithToken', success: false, errorMessage: 'Invalid token' }));
    }
}

function receiveLoginWithCredentials(ws, message) {
    console.log('Login attempt with credentials for user:', message.username);
    const user = Object.values(users).find(user => user.username === message.username && user.password === message.password);
    if (user) {
        const token = Math.random().toString(36).substr(2);
        user.token = token;
        saveUser(user.id);
        ws.send(JSON.stringify({ type: 'loginWithCredentials', success: true, token: token, userId: user.userId }));
        sendDataAfterLogin(ws, user);
    } else {
        ws.send(JSON.stringify({ type: 'loginWithCredentials', success: false, errorMessage: 'Invalid username or password' }));
    }
}

function receiveRegister(ws, message) {
    const user = Object.values(users).find(user => user.username === message.username);
    if (user) {
        ws.send(JSON.stringify({ type: 'register', success: false, errorMessage: 'Username already exists' }));
        return;
    }
    if (message.username === '' || message.password === '') {
        ws.send(JSON.stringify({ type: 'register', success: false, errorMessage: 'Username and password are required' }));
        return;
    }
    const token = Math.random().toString(36).substr(2);
    const newUser = { username: message.username, password: message.password, token: token, id: Math.random().toString(36).substr(2) };
    createUser(newUser);
    ws.send(JSON.stringify({ type: 'register', success: true, token: token, userId: newUser.id }));

}

//////////////////

function receiveMovePlayer(ws, message) {
    const player = players[message.playerId];
    if (!player) {
        console.log('Player not found');
        return;
    }
    const level = levels[player.levelId];
    if (!level) {
        console.log('Level not found');
        return
    }

    movePlayer(player.id, message.direction);
}


module.exports = { startServer, broadcast, clients };