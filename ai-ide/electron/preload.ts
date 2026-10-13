import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  terminal: {
    init: (cols: number, rows: number) => ipcRenderer.send('terminal.init', cols, rows),
    write: (data: string) => ipcRenderer.send('terminal.keystroke', data),
    resize: (cols: number, rows: number) => ipcRenderer.send('terminal.resize', cols, rows),
    onData: (callback: (data: string) => void) => {
      const listener = (_: any, data: string) => callback(data);
      ipcRenderer.on('terminal.incomingData', listener);
      return () => ipcRenderer.removeListener('terminal.incomingData', listener);
    }
  },
  fs: {
    openDirectory: () => ipcRenderer.invoke('fs.openDirectory'),
    readDirectory: (path: string) => ipcRenderer.invoke('fs.readDirectory', path),
    readFile: (path: string) => ipcRenderer.invoke('fs.readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs.writeFile', path, content)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings.get'),
    set: (settings: any) => ipcRenderer.invoke('settings.set', settings)
  }
});
