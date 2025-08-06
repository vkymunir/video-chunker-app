const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Open file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Process video into 5-second chunks
ipcMain.handle('process-video-chunks', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const chunkDuration = 5; // 5 seconds
    const outputDir = path.join(__dirname, '../chunks');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const duration = metadata.format.duration;
      const totalChunks = Math.ceil(duration / chunkDuration);
      
      let processedChunks = 0;
      
      for (let i = 0; i < totalChunks; i++) {
        const startTime = i * chunkDuration;
        const endTime = Math.min((i + 1) * chunkDuration, duration);
        const chunkFilename = `chunk_${String(i + 1).padStart(3, '0')}.mp4`;
        const chunkPath = path.join(outputDir, chunkFilename);
        
        ffmpeg(filePath)
          .setStartTime(startTime)
          .setDuration(endTime - startTime)
          .output(chunkPath)
          .on('end', () => {
            processedChunks++;
            const progress = (processedChunks / totalChunks) * 100;
            event.sender.send('processing-progress', progress);
            
            chunks.push({
              filename: chunkFilename,
              path: chunkPath,
              duration: (endTime - startTime).toFixed(1)
            });
            
            if (processedChunks === totalChunks) {
              resolve({ chunks });
            }
          })
          .on('error', reject)
          .run();
      }
    });
  });
});