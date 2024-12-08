const levels = {};
const players = {};

function movePlayer(playerId, direction) {
    const player = players[playerId];
    if (!player) return;
    const level = levels[player.levelId];
    if (!level) return;
    const { x, y } = player;
    player.x = x + direction.x;
    player.y = y + direction.y;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x >= level.width) player.x = level.width - 1;
    if (player.y >= level.height) player.y = level.height - 1;
}

function addPlayer(playerId, levelId) {
    players[playerId] = {
        id: playerId,
        x: 0,
        y: 0,
        levelId,
    };
}

function addLevel(levelId, level) {
    if(levels[levelId]) {
        console.log('Level already exists');
        return;
    }
    levels[levelId] = level;
}

function addWall(levelId, x1, y1, x2, y2) {
    const level = levels[levelId];
    if (!level) {
        console.log('Level not found');
        return;
    }
    if(x1 > x2) {
        [x1, x2] = [x2, x1];
    }
    if(y1 > y2) {
        [y1, y2] = [y2, y1];
    }
    level.walls.push({ x1, y1, x2, y2 });
}

module.exports = {
    levels,
    players,
    movePlayer,
    addPlayer,
    addLevel,
    addWall,
};