import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { getPrompterWindow } from './windowManager.js'
import { createLogger } from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logger = createLogger('EditorWindow')

let editorWindow = null

export function createEditorWindow() {
  logger.info('Creating editor window...')
  
  if (editorWindow) {
    logger.debug('Editor window already exists, focusing')
    editorWindow.focus()
    return editorWindow
  }

  // Preload path - check both .js and .mjs (electron-vite may output either)
  const preloadJsPath = path.resolve(__dirname, '../preload/index.js')
  const preloadMjsPath = path.resolve(__dirname, '../preload/index.mjs')
  
  let preloadPath
  if (existsSync(preloadJsPath)) {
    preloadPath = preloadJsPath
    logger.debug('Using .js preload file')
  } else if (existsSync(preloadMjsPath)) {
    preloadPath = preloadMjsPath
    logger.debug('Using .mjs preload file')
  } else {
    logger.error('Preload file not found!')
    logger.error('Checked:', preloadJsPath)
    logger.error('Checked:', preloadMjsPath)
    logger.error('__dirname:', __dirname)
    throw new Error(`Preload file not found. Checked: ${preloadJsPath} and ${preloadMjsPath}`)
  }
  
  logger.info('Using preload path:', preloadPath)

  // Set window icon
  const iconPath = path.join(__dirname, '../../src/images/favicon.ico')
  const icon = existsSync(iconPath) ? iconPath : undefined

  editorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'ScriptView - Edytor Skryptu',
    icon: icon, // Set window icon
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load editor HTML
  if (process.env.ELECTRON_RENDERER_URL) {
    editorWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/editor`)
  } else {
    const htmlPath = path.join(__dirname, '../renderer/index.html')
    editorWindow.loadFile(htmlPath).then(() => {
      // Set hash after load - use whitelisted hash value
      const allowedHash = '#/editor'
      editorWindow.webContents.executeJavaScript(`window.location.hash = ${JSON.stringify(allowedHash)}`)
    })
  }

  editorWindow.on('closed', () => {
    editorWindow = null
  })

  // DevTools can be opened manually with F12 or Ctrl+Shift+I
  // Removed auto-open for better UX

  // Listen for text updates from editor and forward to prompter
  editorWindow.webContents.on('did-finish-load', () => {
    // Forward text updates from editor to prompter
    ipcMain.on('editor-text-updated', (event, text) => {
      updatePrompterText(text)
    })
  })

  return editorWindow
}

export function getEditorWindow() {
  return editorWindow
}

// Send text updates to prompter window
export function updatePrompterText(text) {
  const prompterWindow = getPrompterWindow()
  if (prompterWindow) {
    prompterWindow.webContents.send('update-text', text)
  }
}

// IPC handler for text updates from editor
ipcMain.handle('update-prompter-text', (event, text) => {
  updatePrompterText(text)
})
