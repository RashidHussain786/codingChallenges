//  owc.ts -> optimised word count

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Helper function to check if file exists and read its content
function readFileContent(filePath: string): string | null {
    const absolutePath = path.resolve(filePath);
    try {
        // Check if the file exists
        fs.accessSync(absolutePath, fs.constants.F_OK);
        return fs.readFileSync(absolutePath, 'utf8');
    } catch (err) {
        console.error(`File ${absolutePath} does not exist`);
        return null;
    }
}

// Step One: Count Bytes
function countBytes(filePath: string): number | null {
    const content = readFileContent(filePath);
    if (content === null) return null;
    return Buffer.byteLength(content, 'utf8');
}

// Step Two: Count Lines
function countLines(filePath: string): Promise<number> {
    const absolutePath = path.resolve(filePath);
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(absolutePath),
            crlfDelay: Infinity,
        });

        let lineCount = 0;
        rl.on('line', () => lineCount++);
        rl.on('close', () => resolve(lineCount));
        rl.on('error', (err) => reject(`Error reading file: ${err.message}`));
    });
}

// Step Three: Count Words
function countWords(filePath: string): Promise<number> {
    const content = readFileContent(filePath);
    if (content === null) return Promise.reject('File does not exist');
    const words = content.split(/\s+/).filter((word) => word !== '');
    return Promise.resolve(words.length);
}

// Step Four: Count Characters
function countCharacters(filePath: string): Promise<number> {
    const content = readFileContent(filePath);
    if (content === null) return Promise.reject('File does not exist');
    return Promise.resolve(content.length);
}

// Step Five: Count All (bytes, lines, words, characters)
function countAll(filePath: string): Promise<{ bytes: number, lines: number, words: number, characters: number }> {
    const content = readFileContent(filePath);
    if (content === null) return Promise.reject('File does not exist');
    
    const bytes = Buffer.byteLength(content, 'utf8');
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter((word) => word !== '').length;
    const characters = content.length;

    return Promise.resolve({ bytes, lines, words, characters });
}

// Process the input options
async function processInput(option: string, filePath: string): Promise<number | { bytes: number, lines: number, words: number, characters: number }> {
    switch (option) {
        case '-c':
            return countBytes(filePath) ?? Promise.reject('File does not exist');
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

// Handle standard input (stdin) for no filename
function countFromStdin(): Promise<{ bytes: number, lines: number, words: number, characters: number }> {
    return new Promise((resolve, reject) => {
        let content = '';
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            content += input + '\n';
        });

        rl.on('close', () => {
            const bytes = Buffer.byteLength(content, 'utf8');
            const lines = content.split('\n').length - 1;  // Subtract 1 for the last empty line
            const words = content.split(/\s+/).filter((word) => word !== '').length;
            const characters = content.length;

            resolve({ bytes, lines, words, characters });
        });

        rl.on('error', (err) => {
            reject(`Error reading from stdin: ${err.message}`);
        });
    });
}

// Main function to process the arguments
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 1) {
        // Default case: just filename provided
        const filePath = args[0];
        try {
            const result = await countAll(filePath);
            console.log(`${result.lines} ${result.words} ${result.bytes} ${filePath}`);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else if (args.length === 2 && ['-c', '-l', '-w', '-m'].includes(args[0])) {
        // Case with specific option
        const [option, filePath] = args;
        try {
            const count = await processInput(option, filePath);
            if (typeof count === 'number') {
                console.log(`${count} ${filePath}`);
            } else {
                console.log(`${count.bytes} ${count.lines} ${count.words} ${count.characters} ${filePath}`);
            }
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else if (args.length === 0) {
        // No filename provided, read from stdin
        try {
            const result = await countFromStdin();
            console.log(`${result.lines} ${result.words} ${result.bytes}`);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else {
        console.error('Usage: node dist/rwc.js [file] OR node dist/rwc.js [-c|-l|-w|-m] <file>');
        process.exit(1);
    }
}

// Run the main function
main();
