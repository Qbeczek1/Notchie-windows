import { app, ipcMain } from 'electron'
import { createPrompterWindow, getPrompterWindow } from './windowManager.js'
import { createEditorWindow } from './editorWindow.js'
import { createSettingsWindow } from './settingsWindow.js'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts.js'
import { startScreenShareDetection, stopScreenShareDetection, togglePrompterVisibility } from './screenShare.js'
import { createTray } from './tray.js'

app.whenReady().then(() => {
  // Create tray icon first
  createTray()
  
  const prompterWindow = createPrompterWindow()
  
  // Register global shortcuts after window is ready
  prompterWindow.webContents.once('did-finish-load', () => {
    registerGlobalShortcuts()
    // Start screen share detection
    startScreenShareDetection(2000) // Check every 2 seconds
  })
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    prompterWindow.webContents.openDevTools()
  }

  app.on('activate', () => {
    if (!getPrompterWindow()) {
      const newWindow = createPrompterWindow()
      newWindow.webContents.once('did-finish-load', () => {
        registerGlobalShortcuts()
      })
    }
  })

  // IPC handlers to open windows
  ipcMain.handle('open-editor', () => {
    createEditorWindow()
  })

  ipcMain.handle('open-settings', () => {
    createSettingsWindow()
  })
})

app.on('will-quit', () => {
  // Unregister all shortcuts before quitting
  unregisterGlobalShortcuts()
  // Stop screen share detection
  stopScreenShareDetection()
})

// IPC handler to manually toggle visibility
ipcMain.handle('toggle-prompter-visibility', () => {
  togglePrompterVisibility()
})

app.on('window-all-closed', () => {
  // Keep app running - tray icon allows control
  // On Windows/Linux, don't quit when all windows are closed
  if (process.platform !== 'darwin') {
    // Don't quit - tray icon keeps app running
  }
})
