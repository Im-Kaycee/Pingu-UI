import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  resizeWindow: (height: number) => ipcRenderer.send('resize-window', height),
})
