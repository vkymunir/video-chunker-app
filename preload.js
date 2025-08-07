const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  processVideoChunks: (filePath) =>
    ipcRenderer.invoke("process-video-chunks", filePath),
  onProcessingProgress: (callback) => {
    ipcRenderer.on("processing-progress", (event, progress) =>
      callback(progress),
    );
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
