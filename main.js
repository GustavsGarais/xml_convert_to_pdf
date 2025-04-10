const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
const PDFDocument = require('pdfkit');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
      
  });

  win.loadFile('index.html');
}

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
    await require('electron').shell.openPath(filePath);
  });
  

app.whenReady().then(createWindow);

// Handle XML to PDF conversion
ipcMain.handle('convert-xml', async (event, { xmlPath, outputFolder }) => {
  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const parsed = await xml2js.parseStringPromise(xmlContent);
    const outputName = path.basename(xmlPath, '.xml') + '.pdf';
    const outputPath = path.join(outputFolder, outputName);
    const pdfContent = `PDF content generated from ${xmlPath}`;

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));
    doc.fontSize(16).text('XML to PDF Content:\n\n');
    doc.fontSize(12).text(JSON.stringify(parsed, null, 2));
    doc.end();

    return { success: true, path: outputPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
