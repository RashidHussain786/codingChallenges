"use strict";
//  owc.ts -> optimised word count
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const readline = require("readline");
// Helper function to check if file exists and read its content
function readFileContent(filePath) {
    const absolutePath = path.resolve(filePath);
    try {
        // Check if the file exists
        fs.accessSync(absolutePath, fs.constants.F_OK);
        return fs.readFileSync(absolutePath, 'utf8');
    }
    catch (err) {
        console.error(`File ${absolutePath} does not exist`);
        return null;
    }
}
// Step One: Count Bytes
function countBytes(filePath) {
    const content = readFileContent(filePath);
    if (content === null)
        return null;
    return Buffer.byteLength(content, 'utf8');
}
// Step Two: Count Lines
function countLines(filePath) {
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
function countWords(filePath) {
    const content = readFileContent(filePath);
    if (content === null)
        return Promise.reject('File does not exist');
    const words = content.split(/\s+/).filter((word) => word !== '');
    return Promise.resolve(words.length);
}
// Step Four: Count Characters
function countCharacters(filePath) {
    const content = readFileContent(filePath);
    if (content === null)
        return Promise.reject('File does not exist');
    return Promise.resolve(content.length);
}
// Step Five: Count All (bytes, lines, words, characters)
function countAll(filePath) {
    const content = readFileContent(filePath);
    if (content === null)
        return Promise.reject('File does not exist');
    const bytes = Buffer.byteLength(content, 'utf8');
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter((word) => word !== '').length;
    const characters = content.length;
    return Promise.resolve({ bytes, lines, words, characters });
}
// Process the input options
function processInput(option, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        switch (option) {
            case '-c':
                return (_a = countBytes(filePath)) !== null && _a !== void 0 ? _a : Promise.reject('File does not exist');
            case '-l':
                return yield countLines(filePath);
            case '-w':
                return yield countWords(filePath);
            case '-m':
                return yield countCharacters(filePath);
            default:
                return yield countAll(filePath);
        }
    });
}
// Handle standard input (stdin) for no filename
function countFromStdin() {
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
            const lines = content.split('\n').length - 1; // Subtract 1 for the last empty line
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length === 1) {
            // Default case: just filename provided
            const filePath = args[0];
            try {
                const result = yield countAll(filePath);
                console.log(`${result.lines} ${result.words} ${result.bytes} ${filePath}`);
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        }
        else if (args.length === 2 && ['-c', '-l', '-w', '-m'].includes(args[0])) {
            // Case with specific option
            const [option, filePath] = args;
            try {
                const count = yield processInput(option, filePath);
                if (typeof count === 'number') {
                    console.log(`${count} ${filePath}`);
                }
                else {
                    console.log(`${count.bytes} ${count.lines} ${count.words} ${count.characters} ${filePath}`);
                }
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        }
        else if (args.length === 0) {
            // No filename provided, read from stdin
            try {
                const result = yield countFromStdin();
                console.log(`${result.lines} ${result.words} ${result.bytes}`);
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        }
        else {
            console.error('Usage: node dist/rwc.js [file] OR node dist/rwc.js [-c|-l|-w|-m] <file>');
            process.exit(1);
        }
    });
}
// Run the main function
main();
