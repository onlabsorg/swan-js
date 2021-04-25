const swan = require('..');


const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

const read = prompt => new Promise((resolve, reject) => {
    rl.question(prompt, resolve);
});

async function start () {
    const context = swan.createContext();
    while (true) {
        const expression = await read('%> ');
        const evaluate = swan.parse(expression);
        const value = await evaluate(context);
        console.log(await context.str(value));
    }
}

start();