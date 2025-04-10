const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  convertXml: (data) => ipcRenderer.invoke('convert-xml', data),
  openOutputFile: (path) => ipcRenderer.invoke('open-file', path)
});
