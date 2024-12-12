const levels = {};
const players = {};

const gameSessions = [];

const collisionWalls = {};

const ticksPerSecond = 10;

function movePlayer(playerId, direction) {
    const player = players[playerId];
    if (!player) return;
    const level = levels[player.levelId];
    if (!level) return;
    const { x, y } = player;

    const newX = x + direction.x;
    const newY = y + direction.y;
    const directionStr = direction.x == 0 ? 'h' : 'v';
    if (collisionWalls[level.name])
        if (collisionWalls[level.name][`${Math.max(newX, x)},${Math.max(newY, y)},${directionStr}`]) {
            return;
        }

    player.x = x + direction.x;
    player.y = y + direction.y;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x >= level.width) player.x = level.width - 1;
    if (player.y >= level.height) player.y = level.height - 1;
}

function addPlayer(playerId, levelId) {
    if (!playerId)
        playerId = Math.random().toString(36).substr(2);
    players[playerId] = {
        id: playerId,
        x: 0,
        y: 0,
        levelId,
    };
}

function addLevel(levelId, level) {
    if (levels[levelId]) {
        console.log('Level already exists');
        return;
    }
    levels[levelId] = level;
    
    collisionWalls[levelId] = {};
    if (level.walls) {
        for (let wall of level.walls) {
            const direction = wall.x1 === wall.x2 ? 'v' : 'h';
            for (let i = wall.x1; i <= wall.x2; i++) {
                for (let j = wall.y1; j <= wall.y2; j++) {
                    if (i == wall.x2 && j == wall.y2) continue;
                    collisionWalls[levelId][`${i},${j},${direction}`] = true;
                }
            }
        }
    }

}

function addWall(levelId, x1, y1, x2, y2) {
    const level = levels[levelId];
    if (!level) {
        console.log('Level not found');
        return;
    }
    if (x1 > x2) {
        [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
        [y1, y2] = [y2, y1];
    }
    console.log('Adding wall:', x1, y1, x2, y2);
    level.walls.push({ x1, y1, x2, y2 });
    const direction = x1 === x2 ? 'v' : 'h';
    for (let i = x1; i <= x2; i++) {
        for (let j = y1; j <= y2; j++) {
            if (i == x2 && j == y2) continue;
            collisionWalls[levelId][`${i},${j},${direction}`] = true;
        }
    }
}

function broadcastGameData() {
    const { broadcast } = require("./server");
    //console.log('Broadcasting game data');
    if (levels && Object.values(levels).length > 0)
        broadcast(JSON.stringify({ type: 'gameData', level: Object.values(levels)[0], players }));
}

function gameLoop() {
    broadcastGameData();
    setTimeout(gameLoop, 1000 / ticksPerSecond);
}

module.exports = {
    levels,
    players,
    gameSessions,
    movePlayer,
    addPlayer,
    addLevel,
    addWall,
    gameLoop
};