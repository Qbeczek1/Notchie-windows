import { BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPrompterWindow } from './windowManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let settingsWindow = null

export function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return settingsWindow
  }

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 700,
    title: 'Notchie - Ustawienia',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load settings HTML
  if (process.env.ELECTRON_RENDERER_URL) {
    settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/settings`)
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: 'settings' })
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    settingsWindow.webContents.openDevTools()
  }

  return settingsWindow
}

export function getSettingsWindow() {
  return settingsWindow
}
