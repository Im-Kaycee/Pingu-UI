import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 680,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.center();
  });

  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });
}

app.whenReady().then(() => {
  createWindow();

  // Poll the backend for toggle signal
setInterval(async () => {
  try {
    const { net } = require('electron')
    const request = net.request('http://127.0.0.1:8765/poll-toggle')
    request.on('response', (response: any) => {
      let data = ''
      response.on('data', (chunk: any) => { data += chunk })
      response.on('end', () => {
        const json = JSON.parse(data)
        if (json.should_toggle) {
          if (mainWindow?.isVisible()) {
            mainWindow.hide()
          } else {
            mainWindow?.center()
            mainWindow?.show()
          }
        }
      })
    })
    request.end()
  } catch {}
}, 500)
});
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});