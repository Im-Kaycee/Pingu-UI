import { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let backendProcess: ChildProcess | null = null;

function startBackend() {
  const pythonPath = process.env.PINGU_PYTHON || 
    '/home/kelechukwu/Documents/Projects/linux-copilot-backend/backend/bin/python3'
  const scriptPath = process.env.PINGU_SCRIPT || 
    '/home/kelechukwu/Documents/Projects/linux-copilot-backend/backend/App/main.py'
  const cwd = process.env.PINGU_CWD || 
    '/home/kelechukwu/Documents/Projects/linux-copilot-backend/backend/App'

  backendProcess = spawn(pythonPath, [scriptPath], {
    cwd,
    stdio: 'pipe',
  })

  backendProcess.stdout?.on('data', (data) => {
    console.log(`Backend: ${data}`)
  })

  backendProcess.stderr?.on('data', (data) => {
    console.error(`Backend error: ${data}`)
  })

  backendProcess.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`)
  })
}

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
  startBackend();
  createWindow();

  setTimeout(() => {
    const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, 'icon.png')
  : path.join(__dirname, '../../src/icon.png')

    const icon = nativeImage.createFromPath(iconPath)
    const trayIcon = icon.resize({ width: 16, height: 16 })
    tray = new Tray(trayIcon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Pingu',
        click: () => {
          mainWindow?.center()
          mainWindow?.show()
        },
      },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ])

    tray.setToolTip('Pingu')
    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow?.center()
        mainWindow?.show()
      }
    })

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
    }, 100)
  }, 2000)
});
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});