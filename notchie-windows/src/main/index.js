import { app, ipcMain } from 'electron'
import { createPrompterWindow, getPrompterWindow } from './windowManager.js'
import { createEditorWindow } from './editorWindow.js'
import { createSettingsWindow } from './settingsWindow.js'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts.js'
import { startScreenShareDetection, stopScreenShareDetection, togglePrompterVisibility } from './screenShare.js'
import { createTray } from './tray.js'
import { IPC_CHANNELS } from './constants.js'
import { setupGlobalErrorHandlers } from './utils/errorHandler.js'
import { createLogger } from './utils/logger.js'

const logger = createLogger('Main')

// Setup global error handlers first
setupGlobalErrorHandlers()

app.whenReady().then(() => {
  logger.info('Application starting...')
  
  try {
    // Create tray icon first
    createTray()
    logger.info('Tray icon created')
    
    const prompterWindow = createPrompterWindow()
    
    // Register global shortcuts after window is ready
    prompterWindow.webContents.once('did-finish-load', () => {
      try {
        registerGlobalShortcuts()
        logger.info('Global shortcuts registered')
        
        // Start screen share detection
        startScreenShareDetection()
        logger.info('Screen share detection started')
      } catch (error) {
        logger.error('Error initializing window features:', error)
      }
    })
    
    // Handle window errors
    prompterWindow.webContents.on('render-process-gone', (event, details) => {
      logger.error('Render process crashed:', details)
    })
    
    // DevTools can be opened manually with F12 or Ctrl+Shift+I
    // Removed auto-open for better UX

    app.on('activate', () => {
      if (!getPrompterWindow()) {
        logger.info('Recreating prompter window on activate')
        const newWindow = createPrompterWindow()
        newWindow.webContents.once('did-finish-load', () => {
          registerGlobalShortcuts()
        })
      }
    })

    // IPC handlers to open windows
    ipcMain.handle(IPC_CHANNELS.OPEN_EDITOR, () => {
      logger.info('Opening editor window')
      createEditorWindow()
    })

    ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS, () => {
      logger.info('Opening settings window')
      createSettingsWindow()
    })

    ipcMain.handle(IPC_CHANNELS.TOGGLE_PROMPTER_VISIBILITY, () => {
      logger.debug('Toggling prompter visibility')
      togglePrompterVisibility()
    })

    logger.info('Application initialized successfully')
  } catch (error) {
    logger.error('Error during application initialization:', error)
    app.quit()
  }
})

app.on('will-quit', () => {
  logger.info('Application quitting...')
  // Unregister all shortcuts before quitting
  unregisterGlobalShortcuts()
  // Stop screen share detection
  stopScreenShareDetection()
  logger.info('Cleanup completed')
})

app.on('window-all-closed', () => {
  // Keep app running - tray icon allows control
  // On Windows/Linux, don't quit when all windows are closed
  if (process.platform !== 'darwin') {
    // Don't quit - tray icon keeps app running
  }
})
