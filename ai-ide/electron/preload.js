"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    terminal: {
        init: (cols, rows) => electron_1.ipcRenderer.send('terminal.init', cols, rows),
        write: (data) => electron_1.ipcRenderer.send('terminal.keystroke', data),
        resize: (cols, rows) => electron_1.ipcRenderer.send('terminal.resize', cols, rows),
        onData: (callback) => {
            const listener = (_, data) => callback(data);
            electron_1.ipcRenderer.on('terminal.incomingData', listener);
            return () => electron_1.ipcRenderer.removeListener('terminal.incomingData', listener);
        }
    },
    fs: {
        openDirectory: () => electron_1.ipcRenderer.invoke('fs.openDirectory'),
        readDirectory: (path) => electron_1.ipcRenderer.invoke('fs.readDirectory', path),
        readFile: (path) => electron_1.ipcRenderer.invoke('fs.readFile', path),
        writeFile: (path, content) => electron_1.ipcRenderer.invoke('fs.writeFile', path, content)
    },
    settings: {
        get: () => electron_1.ipcRenderer.invoke('settings.get'),
        set: (settings) => electron_1.ipcRenderer.invoke('settings.set', settings)
    }
});
