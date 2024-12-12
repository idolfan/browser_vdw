const users = {};
const fs = require('fs');

function loadUsers() {
    const userFiles = fs.readdirSync('./users');
    for (const userFile of userFiles) {
        const userId = userFile.replace('.json', '');
        const user = require(`../users/${userFile}`);
        users[userId] = user;
    }
}

function saveUser(userId) {
    fs.writeFileSync(`./users/${userId}.json`, JSON.stringify(users[userId], null, 4));
}

function createUser(user) {
    if(!user.id) {
        console.log('User id is required');
        return;
    }
    if(users[user.id]) {
        console.log('User already exists');
        return;
    }
    users[user.id] = user;	
    saveUser(user.id);
}

module.exports = {
    users,
    loadUsers,
    saveUser,
    createUser,
};