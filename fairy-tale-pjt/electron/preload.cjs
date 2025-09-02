// electron/preload.cjs - 이미지 생성 기능이 추가된 버전
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    expandStory: (data) => ipcRenderer.invoke('expand-story', data),
    generateBook: (data) => ipcRenderer.invoke('generate-book', data),
    generateImage: (data) => ipcRenderer.invoke('generate-image', data),
    applyImage: (data) => ipcRenderer.invoke('apply-image', data),
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    testAIConnection: () => ipcRenderer.invoke('test-ai-connection'),
    checkAIHealth: () => ipcRenderer.invoke('check-ai-health'),
});