const fs = require('fs');

function loadLevel(levelname) {
    try {   
    return require(`../levels/${levelname}.json`);
    } catch (err) {
        return null;
    }
}

function saveLevel(levelname, level) {
    fs.writeFileSync(`./levels/${levelname}.json`, JSON.stringify(level, null, 4));
}

function newLevel(width, height, name) {
    return {
        name: name || 'New Level',
        width,
        height,
        walls: [],
    };
}

module.exports = {
    loadLevel,
    saveLevel,
    newLevel,
};