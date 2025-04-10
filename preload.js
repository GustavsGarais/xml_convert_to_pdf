const { contextBridge, ipcRenderer, dialog } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: async () => {
    return await ipcRenderer.invoke('dialog:openFile');
  },
  openFolder: async () => {
    return await ipcRenderer.invoke('dialog:openFolder');
  },
  convertXml: (data) => ipcRenderer.invoke('convert-xml', data),
  openFile: (path) => ipcRenderer.invoke('open-file', path)

});
