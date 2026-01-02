import { BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { getPrompterWindow } from './windowManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let settingsWindow = null

export function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return settingsWindow
  }

  // Preload path - check both .js and .mjs (electron-vite may output either)
  const preloadJsPath = path.resolve(__dirname, '../preload/index.js')
  const preloadMjsPath = path.resolve(__dirname, '../preload/index.mjs')
  
  let preloadPath
  if (existsSync(preloadJsPath)) {
    preloadPath = preloadJsPath
  } else if (existsSync(preloadMjsPath)) {
    preloadPath = preloadMjsPath
  } else {
    console.error('[SettingsWindow] ERROR: Preload file not found!')
    console.error('[SettingsWindow] Checked:', preloadJsPath)
    console.error('[SettingsWindow] Checked:', preloadMjsPath)
    console.error('[SettingsWindow] __dirname:', __dirname)
    throw new Error(`Preload file not found. Checked: ${preloadJsPath} and ${preloadMjsPath}`)
  }
  
  console.log('[SettingsWindow] Using preload path:', preloadPath)

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 700,
    title: 'Notchie - Ustawienia',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load settings HTML
  if (process.env.ELECTRON_RENDERER_URL) {
    settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/settings`)
  } else {
    const htmlPath = path.join(__dirname, '../renderer/index.html')
    settingsWindow.loadFile(htmlPath).then(() => {
      // Set hash after load
      settingsWindow.webContents.executeJavaScript(`window.location.hash = '#/settings'`)
    })
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  // DevTools can be opened manually with F12 or Ctrl+Shift+I
  // Removed auto-open for better UX

  return settingsWindow
}

export function getSettingsWindow() {
  return settingsWindow
}
