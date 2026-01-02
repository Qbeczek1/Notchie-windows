import { BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { getSettings, saveSettings, saveText, getText } from './storage.js'
import { IPC_CHANNELS } from './constants.js'
import { createLogger } from './utils/logger.js'
import { validateWindowWidth, validateWindowHeight } from './utils/validators.js'
import { withErrorHandling, withErrorHandlingSync } from './utils/errorHandler.js'
import { openFileDialog, saveFileDialog } from './fileManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logger = createLogger('WindowManager')

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
  
  logger.debug('Using preload path:', preloadPath)

  // Set window icon
  const iconPath = path.join(__dirname, '../../src/images/favicon.ico')
  const icon = existsSync(iconPath) ? iconPath : undefined

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
    show: true, // Ensure window is visible by default
    icon: icon, // Set window icon
    webPreferences: {
      preload: preloadPath,
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

  // Ensure window is visible after load
  prompterWindow.once('ready-to-show', () => {
    prompterWindow.show()
  })

  // Enable dragging - ignore mouse events but forward them
  prompterWindow.setIgnoreMouseEvents(false, { forward: true })

  // Save window position and size with debouncing
  let saveTimeout = null
  const saveBounds = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      try {
        const bounds = prompterWindow.getBounds()
        windowStore.set('windowX', bounds.x)
        windowStore.set('windowY', bounds.y)
        windowStore.set('windowWidth', validateWindowWidth(bounds.width))
        windowStore.set('windowHeight', validateWindowHeight(bounds.height))
      } catch (error) {
        logger.error('Error saving window bounds:', error)
      }
    }, 300) // Debounce 300ms
  }

  prompterWindow.on('moved', saveBounds)
  prompterWindow.on('resized', saveBounds)

  // Send initial settings to renderer when window is ready
  prompterWindow.webContents.once('did-finish-load', () => {
    try {
      const settings = getSettings()
      prompterWindow.webContents.send(IPC_CHANNELS.LOAD_SETTINGS, settings)
      logger.info('Settings loaded and sent to renderer')
    } catch (error) {
      logger.error('Error loading settings:', error)
    }
  })

  // Listen for settings updates and apply window size changes
  ipcMain.on(IPC_CHANNELS.SETTINGS_UPDATED, (event, settings) => {
    try {
      if (settings?.windowWidth && settings?.windowHeight && prompterWindow) {
        const validatedWidth = validateWindowWidth(settings.windowWidth)
        const validatedHeight = validateWindowHeight(settings.windowHeight)
        const currentBounds = prompterWindow.getBounds()
        prompterWindow.setBounds({
          ...currentBounds,
          width: validatedWidth,
          height: validatedHeight
        })
        logger.debug('Window size updated from settings')
      }
    } catch (error) {
      logger.error('Error updating window size from settings:', error)
    }
  })

  prompterWindow.on('closed', () => {
    prompterWindow = null
  })

  return prompterWindow
}

// Resize state management
let resizeState = null

// Handle resize start from renderer (for frameless transparent windows in Electron 30+)
ipcMain.on(IPC_CHANNELS.START_RESIZE, (event, direction) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) return
  
  const { screen } = require('electron')
  const cursorPos = screen.getCursorScreenPoint()
  const bounds = win.getBounds()
  
  resizeState = {
    window: win,
    direction,
    startBounds: { ...bounds },
    startCursor: { ...cursorPos }
  }
})

// Handle resize move
ipcMain.on('resize-move', (event) => {
  if (!resizeState || !resizeState.window || resizeState.window.isDestroyed()) return
  
  const { screen } = require('electron')
  const currentCursor = screen.getCursorScreenPoint()
  const { direction, startBounds, startCursor, window: win } = resizeState
  
  const dx = currentCursor.x - startCursor.x
  const dy = currentCursor.y - startCursor.y
  
  const newBounds = { ...startBounds }
  
  if (direction.includes('left')) {
    newBounds.x = startBounds.x + dx
    newBounds.width = Math.max(200, startBounds.width - dx)
  }
  if (direction.includes('right')) {
    newBounds.width = Math.max(200, startBounds.width + dx)
  }
  if (direction.includes('top')) {
    newBounds.y = startBounds.y + dy
    newBounds.height = Math.max(50, startBounds.height - dy)
  }
  if (direction.includes('bottom')) {
    newBounds.height = Math.max(50, startBounds.height + dy)
  }
  
  win.setBounds(newBounds)
})

// Handle resize end
ipcMain.on('resize-end', () => {
  resizeState = null
})

export function getPrompterWindow() {
  return prompterWindow
}

// IPC handlers for window management
ipcMain.handle(IPC_CHANNELS.GET_WINDOW_BOUNDS, withErrorHandlingSync(() => {
  if (prompterWindow) {
    return prompterWindow.getBounds()
  }
  return null
}))

ipcMain.handle(IPC_CHANNELS.SET_WINDOW_BOUNDS, withErrorHandlingSync((event, bounds) => {
  if (prompterWindow && bounds) {
    const validatedBounds = {
      ...bounds,
      width: validateWindowWidth(bounds.width),
      height: validateWindowHeight(bounds.height)
    }
    prompterWindow.setBounds(validatedBounds)
    windowStore.set('windowWidth', validatedBounds.width)
    windowStore.set('windowHeight', validatedBounds.height)
    windowStore.set('windowX', validatedBounds.x)
    windowStore.set('windowY', validatedBounds.y)
    logger.debug('Window bounds updated')
  }
}))

// IPC handlers for settings
ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, withErrorHandlingSync(() => {
  return getSettings()
}))

ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, withErrorHandlingSync((event, settings) => {
  if (settings) {
    saveSettings(settings)
    logger.debug('Settings saved')
    
    // Send updated settings to prompter window
    if (prompterWindow && !prompterWindow.isDestroyed()) {
      const updatedSettings = getSettings()
      prompterWindow.webContents.send(IPC_CHANNELS.LOAD_SETTINGS, updatedSettings)
      logger.debug('Settings sent to prompter window')
    }
    
    // Also emit SETTINGS_UPDATED for window size updates
    if (settings.windowWidth || settings.windowHeight) {
      ipcMain.emit(IPC_CHANNELS.SETTINGS_UPDATED, event, settings)
    }
  }
}))

ipcMain.handle(IPC_CHANNELS.SAVE_TEXT, withErrorHandlingSync((event, text) => {
  if (typeof text === 'string') {
    saveText(text)
    logger.debug('Text saved')
  }
}))

ipcMain.handle(IPC_CHANNELS.GET_TEXT, withErrorHandlingSync(() => {
  return getText()
}))

// IPC handlers for file operations
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, withErrorHandling(async (event) => {
  logger.info('Opening file dialog')
  // Get the window that sent the IPC message
  const window = BrowserWindow.fromWebContents(event.sender)
  return await openFileDialog(window)
}))

ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, withErrorHandling(async (event, content) => {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string')
  }
  logger.info('Saving file dialog')
  // Get the window that sent the IPC message
  const window = BrowserWindow.fromWebContents(event.sender)
  return await saveFileDialog(content, window)
}))
