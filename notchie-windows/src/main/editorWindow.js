import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPrompterWindow } from './windowManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let editorWindow = null

export function createEditorWindow() {
  if (editorWindow) {
    editorWindow.focus()
    return editorWindow
  }

  editorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Notchie - Edytor Skryptu',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load editor HTML
  if (process.env.ELECTRON_RENDERER_URL) {
    editorWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/editor`)
  } else {
    editorWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: 'editor' })
  }

  editorWindow.on('closed', () => {
    editorWindow = null
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    editorWindow.webContents.openDevTools()
  }

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
