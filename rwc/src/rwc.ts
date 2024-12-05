// rwc.ts -> read word count

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Step One, In this step your goal is to write a simple version of wc, let’s call it rwc (r for rashid) that takes the command line option -c and outputs the number of bytes in a file.
function countBytes(filePath: string): number {
    const absolutePath = path.resolve(filePath);
    if(!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        process.exit(1);
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    return Buffer.byteLength(content, 'utf8');
}

// Step Two, In this step your goal is to support the command line option -l that outputs the number of lines in a file.
function countLines(filePath: string): Promise<number> {
    const absolutePath = path.resolve(filePath);
    if(!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        process.exit(1);
    }
    const rl = readline.createInterface({
        input: fs.createReadStream(absolutePath),
        crlfDelay: Infinity
    });
    
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        rl.on('line', () => {
            lineCount++;
        });
        rl.on('close', () => {
            resolve(lineCount);
        });
    });
}
// Step Three, In this step your goal is to support the command line option -w that outputs the number of words in a file. 
function countWords(filepath: string): Promise<number> {
    const absolutePath = path.resolve(filepath);
    if(!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        process.exit(1);
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    const words = content.split(/\s+/).filter(word => word !== '');
    return Promise.resolve(words.length);
}

// Step Four, In this step your goal is to support the command line option -m that outputs the number of characters in a file.

function countCharacters(filepath: string): Promise<number> {
    const absolutePath = path.resolve(filepath);
    if(!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        process.exit(1);
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    return Promise.resolve(content.length);
}
// step 5, In this step your goal is to support the default option - i.e. no options are provided, which is the equivalent to the -c, -l and -w options.
function countAll(filepath: string): Promise<{bytes: number, lines: number, words: number, characters: number}> {
    const absolutePath = path.resolve(filepath);
    if(!fs.existsSync(absolutePath)) {
        console.error(`File ${absolutePath} does not exist`);
        process.exit(1);
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    const bytes = Buffer.byteLength(content, 'utf8');
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(word => word !== '').length;
    const characters = content.length;
    return Promise.resolve({bytes, lines, words, characters});
}

async function processInput(option: string, filePath: string): Promise<number | {bytes: number, lines: number, words: number, characters: number}>{
    switch(option) {
        case '-c':
            return countBytes(filePath);
        case '-l':
            return await countLines(filePath);
        case '-w':
            return await countWords(filePath);
        case '-m':
            return await countCharacters(filePath);
        default:
            return await countAll(filePath);
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 1) {
        // Default case: just filename provided
        const filePath = args[0];
        const result = await countAll(filePath);
        console.log(`${result.lines} ${result.words} ${result.bytes} ${filePath}`);
    } else if (args.length === 2 && ['-c', '-l', '-w', '-m'].includes(args[0])) {
        // Case with specific option
        const [option, filePath] = args;
        const count = await processInput(option, filePath);
        console.log(`${count} ${filePath}`);
    } else {
        console.error('Usage: node dist/rwc.js [file] OR node dist/rwc.js [-c|-l|-w|-m] <file>');
        process.exit(1);
    }
}


main();