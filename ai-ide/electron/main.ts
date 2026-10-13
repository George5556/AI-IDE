import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as pty from 'node-pty';

let mainWindow: BrowserWindow | null = null;
let ptyProcess: pty.IPty | null = null;

const isDev = process.env.NODE_ENV === 'development';

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read settings', e);
  }
  return { apiKey: '', baseUrl: '', model: 'gpt-3.5-turbo' };
}

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC: Terminal
ipcMain.on('terminal.keystroke', (event, key) => {
  ptyProcess?.write(key);
});

ipcMain.on('terminal.init', (event, cols, rows) => {
  if (ptyProcess) {
    ptyProcess.kill();
  }

  const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || 'bash';
  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: app.getPath('home'),
    env: process.env as any
  });

  ptyProcess.onData((data) => {
    mainWindow?.webContents.send('terminal.incomingData', data);
  });
});

ipcMain.on('terminal.resize', (event, cols, rows) => {
  ptyProcess?.resize(cols, rows);
});

// IPC: File System
ipcMain.handle('fs.openDirectory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

function readDirRecursive(dir: string): any {
  const result: any[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
         result.push({ name: file, path: filePath, isDirectory: true, children: readDirRecursive(filePath) });
      }
    } else {
      result.push({ name: file, path: filePath, isDirectory: false });
    }
  });
  return result;
}

ipcMain.handle('fs.readDirectory', (event, dirPath) => {
  try {
    return readDirRecursive(dirPath);
  } catch (e) {
    console.error(e);
    return null;
  }
});

ipcMain.handle('fs.readFile', (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(e);
    return null;
  }
});

ipcMain.handle('fs.writeFile', (event, filePath, content) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
});

// IPC: Settings
ipcMain.handle('settings.get', () => {
  return getSettings();
});

ipcMain.handle('settings.set', (event, settings) => {
  saveSettings(settings);
  return true;
});
