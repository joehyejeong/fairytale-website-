// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    expandStory: (data) => ipcRenderer.invoke('expand-story', data),
    generateBook: (data) => ipcRenderer.invoke('generate-book', data),
    generateImage: (data) => ipcRenderer.invoke('generate-image', data),
});
