const { startServer, broadcast } = require('./server');
const readline = require('readline');
const commands = require('./commands');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

startServer();

rl.on('line', (input) => {
    if (input.trim()) {
        //console.log(`${input}`);
        // Split the input into an array of words
        const words = input.split(' ');
        const command_word = words[0];
        const args = words.slice(1);
        const command = commands[command_word];
        if(!command) {
            console.log('Command not found. Type "help" to list all available commands.');
            return;
        }
        if(!args) {
            console.log('Invalid arguments');
            return;
        }
        if(args.length < command.args.length) {
            console.log('Invalid arguments, required:', command.args);
            return;
        }
        if (command) command.execution(args); 
        else console.log('Command not found. Type "help" to list all available commands.');
    }
});