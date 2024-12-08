const { broadcast } = require('./server');
const { loadLevel: game_loadLevel } = require('./level');
const { addLevel } = require('./game');

const help = {
    description: 'List all available commands',
    execution: execute_help,
    args: [],
}

const message = {
    description: 'Send a message to all connected clients',
    execution: execute_message,
    args: ['message'],
}

const print = {
    description: 'Prints game data to the console',
    execution: execute_print,
    args: [],
}

const loadLevel = {
    description: 'Load a level from a file',
    execution: execute_loadLevel,
    args: ['levelname'],
}

const evaluate = {
    description: 'Evaluate a JavaScript expression',
    execution: execute_eval,
    args: ['expression'],
}

function execute_loadLevel(args) {
    const levelname = args[0];
    const level = game_loadLevel(levelname);
    if (!level) {
        console.log(`Level not found: ${levelname}`);
        return;
    }
    addLevel(levelname, level);
    console.log(`Level loaded: ${levelname}`);

}

function execute_print(args) {
    if (!Array.isArray(args) || args.length < 1) {
        console.log('Invalid arguments');
        return;
    }
    try {
        const code = args.join(' ');
        console.log(eval(code));

    } catch (err) {
        console.log('Error:', err);
    }

}

function execute_eval(args) {
    if (!Array.isArray(args) || args.length < 1) {
        console.log('Invalid arguments');
        return;
    }
    try {
        const code = args.join(' ');
        eval(code);

    } catch (err) {
        console.log('Error:', err);
    }

}

function execute_help() {
    const result = Object.keys(commands).reduce((acc, key) => {
        const description = commands[key].description;
        if (!acc[description]) acc[description] = [];
        acc[description].push(key);
        return acc;
    }, {});
    for (const description in result) {
        console.log(`${result[description].join(', ')}: ${description}`);
    }
}

function execute_message(args) {
    const message = args.join(' ');
    broadcast(message);
    console.log(`Message sent: ${message}`);
}

const commands = {
    'help': help,
    'h': help,
    'message': message,
    'm': message,
    'print': print,
    'p': print,
    'loadLevel': loadLevel,
    'll': loadLevel,
    'eval': evaluate,
}

module.exports = commands;