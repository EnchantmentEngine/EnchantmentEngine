

/* eslint-disable @typescript-eslint/no-var-requires */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this script is located
const scriptDir = __dirname;
const gltfToolsPath = path.join(scriptDir, 'gltf-texture-converter.sh');

// Check if the shell script exists
if (!fs.existsSync(gltfToolsPath)) {
    console.error('Error: gltf-texture-converter.sh not found in scripts directory');
    process.exit(1);
}

// Make sure the shell script is executable (Unix-like systems)
try {
    fs.chmodSync(gltfToolsPath, '755');
} catch (error) {
    // Ignore chmod errors on Windows
}

// Get command line arguments (skip the first two: node and script path)
const args = process.argv.slice(2);

// Determine the shell to use
let shell;
let shellArgs;

if (process.platform === 'win32') {
    // Windows: use bash if available (WSL, Git Bash, etc.)
    if (process.env.WSL_DISTRO_NAME || process.env.MSYS) {
        shell = 'bash';
        shellArgs = [gltfToolsPath, ...args];
    } else {
        // Try to find bash in common locations
        const possibleBashPaths = [
            'C:\\Program Files\\Git\\bin\\bash.exe',
            'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
            process.env.GIT_BASH_PATH ? `${process.env.GIT_BASH_PATH}\\bash.exe` : null
        ].filter(Boolean);

        let bashFound = false;
        for (const bashPath of possibleBashPaths) {
            if (fs.existsSync(bashPath)) {
                shell = bashPath;
                shellArgs = [gltfToolsPath, ...args];
                bashFound = true;
                break;
            }
        }

        if (!bashFound) {
            console.error('Error: Bash not found. Please install Git Bash or WSL to use gltf-texture-converter on Windows.');
            console.error('Alternatively, you can run the script directly with bash if available.');
            process.exit(1);
        }
    }
} else {
    // Unix-like systems (Linux, macOS)
    shell = 'bash';
    shellArgs = [gltfToolsPath, ...args];
}

// Spawn the process
const child = spawn(shell, shellArgs, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
});

// Handle process events
child.on('error', (error) => {
    console.error('Error spawning process:', error.message);
    process.exit(1);
});

child.on('close', (code) => {
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    child.kill('SIGTERM');
}); 