const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'XML Files', extensions: ['xml'] }]
  });
  return canceled ? null : filePaths;
});

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('open-file', async (event, filePath) => {
  if (!filePath) {
    console.error("open-file called with undefined path");
    return;
  }
  await shell.openPath(filePath);
});

ipcMain.handle('convert-xml', async (event, { xmlPath, outputFolder }) => {
  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

    // Simulate PDF content from XML
    const pdfContent = `PDF created from: ${xmlPath}\n\n${xmlContent}`;

    const outputName = path.basename(xmlPath, '.xml') + '.pdf';
    const outputPath = path.join(outputFolder, outputName);

    fs.writeFileSync(outputPath, pdfContent);

    return { success: true, path: outputPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
