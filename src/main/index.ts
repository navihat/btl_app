import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as fs from 'fs'

process.on('uncaughtException', (error) => {
  const logPath = join(app.getPath('userData'), 'crash.log')
  fs.writeFileSync(logPath, `Crash: ${error.stack}\n`, { flag: 'a' })
  dialog.showErrorBox('App Crash', error.stack || error.message || String(error))
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  const logPath = join(app.getPath('userData'), 'crash.log')
  fs.writeFileSync(logPath, `Promise Rejection: ${String(reason)}\n`, { flag: 'a' })
  dialog.showErrorBox('Unhandled Promise Rejection', String(reason))
  app.quit()
})
import { registerQuestionHandlers } from './ipc/questionHandlers'
import { registerExamHandlers } from './ipc/examHandlers'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    },
    title: 'Ứng dụng Tạo Đề Trắc Nghiệm'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    registerQuestionHandlers()
    registerExamHandlers()
    
    ipcMain.on('app:quit', () => {
      app.quit()
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
