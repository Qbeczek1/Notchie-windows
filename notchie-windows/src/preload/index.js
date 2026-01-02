import { contextBridge, ipcRenderer } from 'electron'

/**
 * Preload script - Safe bridge between main and renderer processes
 * Exposes only necessary APIs with proper error handling
 */

// IPC Channel constants (must match main process)
const IPC_CHANNELS = {
  GET_WINDOW_BOUNDS: 'get-window-bounds',
  SET_WINDOW_BOUNDS: 'set-window-bounds',
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  SAVE_TEXT: 'save-text',
  GET_TEXT: 'get-text',
  LOAD_SETTINGS: 'load-settings',
  OPEN_FILE_DIALOG: 'open-file-dialog',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  UPDATE_TEXT: 'update-text',
  UPDATE_PROMPTER_TEXT: 'update-prompter-text',
  OPEN_EDITOR: 'open-editor',
  OPEN_SETTINGS: 'open-settings',
  TOGGLE_PROMPTER_VISIBILITY: 'toggle-prompter-visibility',
  SHORTCUT_SPEED_INCREASE: 'shortcut-speed-increase',
  SHORTCUT_SPEED_DECREASE: 'shortcut-speed-decrease',
  SHORTCUT_TOGGLE_PLAY: 'shortcut-toggle-play',
  SHORTCUT_RESET: 'shortcut-reset'
}

// Safe wrapper for IPC invoke with error handling
const safeInvoke = async (channel, ...args) => {
  try {
    const result = await ipcRenderer.invoke(channel, ...args)
    if (result?.error) {
      throw new Error(result.message || 'IPC call failed')
    }
    return result
  } catch (error) {
    console.error(`IPC invoke error [${channel}]:`, error)
    throw error
  }
}

// Safe wrapper for IPC on with cleanup
const safeOn = (channel, callback) => {
  const wrappedCallback = (event, ...args) => {
    try {
      callback(...args)
    } catch (error) {
      console.error(`IPC listener error [${channel}]:`, error)
    }
  }
  
  ipcRenderer.on(channel, wrappedCallback)
  
  // Return cleanup function
  return () => {
    ipcRenderer.removeListener(channel, wrappedCallback)
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
console.log('[Preload] Exposing electronAPI to renderer')
contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  getWindowBounds: () => safeInvoke(IPC_CHANNELS.GET_WINDOW_BOUNDS),
  setWindowBounds: (bounds) => safeInvoke(IPC_CHANNELS.SET_WINDOW_BOUNDS, bounds),
  
  // Settings
  getSettings: () => safeInvoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings) => safeInvoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  saveText: (text) => safeInvoke(IPC_CHANNELS.SAVE_TEXT, text),
  getText: () => safeInvoke(IPC_CHANNELS.GET_TEXT),
  onLoadSettings: (callback) => safeOn(IPC_CHANNELS.LOAD_SETTINGS, callback),
  
  // File operations
  openFileDialog: () => safeInvoke(IPC_CHANNELS.OPEN_FILE_DIALOG),
  saveFileDialog: (content) => safeInvoke(IPC_CHANNELS.SAVE_FILE_DIALOG, content),
  onUpdateText: (callback) => safeOn(IPC_CHANNELS.UPDATE_TEXT, callback),
  updatePrompterText: (text) => safeInvoke(IPC_CHANNELS.UPDATE_PROMPTER_TEXT, text),
  
  // Window controls
  openEditor: () => safeInvoke(IPC_CHANNELS.OPEN_EDITOR),
  openSettings: () => safeInvoke(IPC_CHANNELS.OPEN_SETTINGS),
  togglePrompterVisibility: () => safeInvoke(IPC_CHANNELS.TOGGLE_PROMPTER_VISIBILITY),
  
  // Shortcuts
  onShortcut: (callback) => {
    const cleanups = [
      safeOn(IPC_CHANNELS.SHORTCUT_SPEED_INCREASE, () => callback('speed-increase')),
      safeOn(IPC_CHANNELS.SHORTCUT_SPEED_DECREASE, () => callback('speed-decrease')),
      safeOn(IPC_CHANNELS.SHORTCUT_TOGGLE_PLAY, () => callback('toggle-play')),
      safeOn(IPC_CHANNELS.SHORTCUT_RESET, () => callback('reset'))
    ]
    
    // Return cleanup function
    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  },
  
  // Remove listeners (for cleanup)
  removeAllListeners: (channel) => {
    try {
      ipcRenderer.removeAllListeners(channel)
    } catch (error) {
      console.error(`Error removing listeners for ${channel}:`, error)
    }
  }
})

console.log('[Preload] electronAPI exposed successfully')
