#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mri from 'mri';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = mri(process.argv.slice(2), {
    alias: { i: 'image', a: 'add', h: 'help', v: 'version' }
});

const SUPPORTED_EXT = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i;

// 1. Handle --help and --version flags cleanly
if (args.help) {
    console.log(`
  🌿 letgo - Take a quick breather in your terminal.

  Usage:
    $ letgo                       Display a random nature scene
    $ letgo <file>                Display a custom image once
    $ letgo --image, -i <file>    Display a custom image once
    $ letgo --add, -a <file>      Save/upload an image to your permanent collection
    $ letgo --hd                  Render using native inline HD protocol

  Supported formats: .jpg, .jpeg, .png, .gif, .bmp, .tiff
`);
    process.exit(0);
}

if (args.version) {
    const pkgPath = path.join(__dirname, 'package.json');
    const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { version: '1.0.0' };
    console.log(`v${pkg.version}`);
    process.exit(0);
}

// 2. Handle --add / -a to permanently upload an image into assets/
if (args.add !== undefined) {
    if (typeof args.add !== 'string' || args.add.trim() === '') {
        console.error('\n❌ Please provide an image path to upload. Example: letgo --add ~/Pictures/beach.jpg\n');
        process.exit(1);
    }

    const sourcePath = path.resolve(args.add);
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
        console.error(`\n❌ File not found: "${args.add}"\n`);
        process.exit(1);
    }

    if (!SUPPORTED_EXT.test(sourcePath)) {
        console.error(`\n❌ Unsupported format ("${path.extname(sourcePath)}"). Please upload a .jpg or .png file.\n`);
        process.exit(1);
    }

    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const destFileName = `custom-${Date.now()}${path.extname(sourcePath)}`;
    const destPath = path.join(assetsDir, destFileName);

    fs.copyFileSync(sourcePath, destPath);
    console.log(`\n✅ Successfully added "${path.basename(sourcePath)}" to your letgo collection!\n`);
    // Automatically display the newly uploaded image right away:
    args.image = destPath;
}

// Force terminal-image to use universal ANSI blocks by hiding iTerm/VS Code env vars before import
const originalTermProgram = process.env.TERM_PROGRAM;
delete process.env.TERM_PROGRAM;
delete process.env.ITERM_SESSION_ID;
const { default: terminalImage } = await import('terminal-image');
process.env.TERM_PROGRAM = originalTermProgram;

function renderCenteredBlockImage(multilineStr, leftPad) {
    const padSpaces = ' '.repeat(leftPad);
    return multilineStr
        .split('\n')
        .map((line) => padSpaces + line)
        .join('\n');
}

function renderCenteredHDImage(filePath, targetCols, leftPad) {
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    const padSpaces = ' '.repeat(leftPad);
    return `${padSpaces}\x1b]1337;File=inline=1;size=${fileData.length};width=${targetCols};preserveAspectRatio=1:${base64Data}\x07\n`;
}

function centerText(text, termCols) {
    const pad = Math.max(0, Math.floor((termCols - text.length) / 2));
    return ' '.repeat(pad) + text;
}

async function run() {
    const rawCustomInput = args.image ?? args._[0];
    let imgPath = null;
    let warningMsg = null;

    // 3. Validate custom image input
    if (rawCustomInput !== undefined) {
        if (typeof rawCustomInput !== 'string' || rawCustomInput.trim() === '') {
            warningMsg = '⚠️  No file path provided for --image. Showing a default nature scene...';
        } else {
            const resolvedPath = path.resolve(rawCustomInput);
            if (!fs.existsSync(resolvedPath)) {
                warningMsg = `⚠️  File not found ("${rawCustomInput}"). Showing a default nature scene...`;
            } else if (!fs.statSync(resolvedPath).isFile()) {
                warningMsg = `⚠️  "${rawCustomInput}" is a directory, not an image file. Showing a default nature scene...`;
            } else if (!SUPPORTED_EXT.test(resolvedPath)) {
                warningMsg = `⚠️  Unsupported format ("${path.extname(resolvedPath)}"). Use JPG or PNG. Showing a default nature scene...`;
            } else {
                imgPath = resolvedPath;
            }
        }
    }

    // 4. Fallback to default assets with safety checks
    if (!imgPath) {
        const assetsDir = path.join(__dirname, 'assets');
        if (!fs.existsSync(assetsDir)) {
            console.error('\n❌ Error: The "assets" folder is missing from the letgo installation.\n');
            process.exit(1);
        }

        const files = fs.readdirSync(assetsDir).filter((file) => SUPPORTED_EXT.test(file));
        if (files.length === 0) {
            console.error('\n❌ Error: No valid images (.jpg, .png) found inside the "assets" folder.\n');
            process.exit(1);
        }

        const randomFile = files[Math.floor(Math.random() * files.length)];
        imgPath = path.join(assetsDir, randomFile);
    }

    try {
        process.stdout.write('\x1Bc');

        const termCols = Math.max(40, process.stdout.columns || 80);
        const targetCols = Math.max(20, Math.floor(termCols * 0.5));
        const leftPad = Math.max(0, Math.floor((termCols - targetCols) / 2));

        if (args.add) {
            console.log('\n' + centerText(`✅ Saved "${path.basename(args.add)}" to your letgo collection!`, termCols));
        } else if (warningMsg) {
            console.log('\n' + centerText(warningMsg, termCols));
        } else {
            console.log('\n');
        }

        if (args.hd) {
            fs.writeSync(1, renderCenteredHDImage(imgPath, targetCols, leftPad));
        } else {
            const rendered = await terminalImage.file(imgPath, {
                width: targetCols
            });
            console.log(renderCenteredBlockImage(rendered, leftPad));
        }

        const msg = '🌿 Take a deep breath. The bug can wait 5 minutes.';
        console.log('\n' + centerText(msg, termCols) + '\n');
    } catch (error) {
        console.error('\n❌ Oops, could not render the image (ensure it is a valid JPEG/PNG, not an AVIF/WebP renamed to .jpg):', error.message);
        process.exit(1);
    }
}

run();