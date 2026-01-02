import { BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSettings, saveSettings, saveText, getText } from './storage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const windowStore = new Store({
  defaults: {
    windowWidth: 600,
    windowHeight: 150,
    windowX: undefined,
    windowY: undefined
  }
})

let prompterWindow = null

export function createPrompterWindow() {
  // Get saved bounds or use defaults
  const savedBounds = {
    width: windowStore.get('windowWidth'),
    height: windowStore.get('windowHeight'),
    x: windowStore.get('windowX'),
    y: windowStore.get('windowY')
  }

  prompterWindow = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    x: savedBounds.x,
    y: savedBounds.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load the app
  if (process.env.ELECTRON_RENDERER_URL) {
    prompterWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    prompterWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Enable dragging - ignore mouse events but forward them
  prompterWindow.setIgnoreMouseEvents(false, { forward: true })

  // Save window position and size
  prompterWindow.on('moved', () => {
    const bounds = prompterWindow.getBounds()
    windowStore.set('windowX', bounds.x)
    windowStore.set('windowY', bounds.y)
  })

  prompterWindow.on('resized', () => {
    const bounds = prompterWindow.getBounds()
    windowStore.set('windowWidth', bounds.width)
    windowStore.set('windowHeight', bounds.height)
  })

  // Send initial settings to renderer when window is ready
  prompterWindow.webContents.once('did-finish-load', () => {
    const settings = getSettings()
    prompterWindow.webContents.send('load-settings', settings)
  })

  // Listen for settings updates and apply window size changes
  ipcMain.on('settings-updated', (event, settings) => {
    if (settings.windowWidth && settings.windowHeight && prompterWindow) {
      const currentBounds = prompterWindow.getBounds()
      prompterWindow.setBounds({
        ...currentBounds,
        width: settings.windowWidth,
        height: settings.windowHeight
      })
    }
  })

  prompterWindow.on('closed', () => {
    prompterWindow = null
  })

  return prompterWindow
}

export function getPrompterWindow() {
  return prompterWindow
}

// IPC handlers for window management
ipcMain.handle('get-window-bounds', () => {
  if (prompterWindow) {
    return prompterWindow.getBounds()
  }
  return null
})

ipcMain.handle('set-window-bounds', (event, bounds) => {
  if (prompterWindow) {
    prompterWindow.setBounds(bounds)
    windowStore.set('windowWidth', bounds.width)
    windowStore.set('windowHeight', bounds.height)
    windowStore.set('windowX', bounds.x)
    windowStore.set('windowY', bounds.y)
  }
})

// IPC handlers for settings
ipcMain.handle('get-settings', () => {
  return getSettings()
})

ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings)
})

ipcMain.handle('save-text', (event, text) => {
  saveText(text)
})

ipcMain.handle('get-text', () => {
  return getText()
})

// IPC handlers for file operations
import { openFileDialog, saveFileDialog, readTextFile, writeTextFile } from './fileManager.js'

ipcMain.handle('open-file-dialog', async () => {
  try {
    return await openFileDialog()
  } catch (error) {
    console.error('Error in open-file-dialog:', error)
    return { error: error.message }
  }
})

ipcMain.handle('save-file-dialog', async (event, content) => {
  try {
    return await saveFileDialog(content)
  } catch (error) {
    console.error('Error in save-file-dialog:', error)
    return { error: error.message }
  }
})
