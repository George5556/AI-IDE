"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const pty = __importStar(require("node-pty"));
let mainWindow = null;
let ptyProcess = null;
const isDev = process.env.NODE_ENV === 'development';
const settingsPath = path.join(electron_1.app.getPath('userData'), 'settings.json');
function getSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        }
    }
    catch (e) {
        console.error('Failed to read settings', e);
    }
    return { apiKey: '', baseUrl: '', model: 'gpt-3.5-turbo' };
}
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }
    catch (e) {
        console.error('Failed to save settings', e);
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0d1117',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC: Terminal
electron_1.ipcMain.on('terminal.keystroke', (event, key) => {
    ptyProcess?.write(key);
});
electron_1.ipcMain.on('terminal.init', (event, cols, rows) => {
    if (ptyProcess) {
        ptyProcess.kill();
    }
    const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || 'bash';
    ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: cols || 80,
        rows: rows || 24,
        cwd: electron_1.app.getPath('home'),
        env: process.env
    });
    ptyProcess.onData((data) => {
        mainWindow?.webContents.send('terminal.incomingData', data);
    });
});
electron_1.ipcMain.on('terminal.resize', (event, cols, rows) => {
    ptyProcess?.resize(cols, rows);
});
// IPC: File System
electron_1.ipcMain.handle('fs.openDirectory', async () => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0] || null;
});
function readDirRecursive(dir) {
    const result = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                result.push({ name: file, path: filePath, isDirectory: true, children: readDirRecursive(filePath) });
            }
        }
        else {
            result.push({ name: file, path: filePath, isDirectory: false });
        }
    });
    return result;
}
electron_1.ipcMain.handle('fs.readDirectory', (event, dirPath) => {
    try {
        return readDirRecursive(dirPath);
    }
    catch (e) {
        console.error(e);
        return null;
    }
});
electron_1.ipcMain.handle('fs.readFile', (event, filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    }
    catch (e) {
        console.error(e);
        return null;
    }
});
electron_1.ipcMain.handle('fs.writeFile', (event, filePath, content) => {
    try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
});
// IPC: Settings
electron_1.ipcMain.handle('settings.get', () => {
    return getSettings();
});
electron_1.ipcMain.handle('settings.set', (event, settings) => {
    saveSettings(settings);
    return true;
});
