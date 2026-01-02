import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  setWindowBounds: (bounds) => ipcRenderer.invoke('set-window-bounds', bounds),
  onWindowMoved: (callback) => ipcRenderer.on('window-moved', callback),
  onWindowResized: (callback) => ipcRenderer.on('window-resized', callback),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  saveText: (text) => ipcRenderer.invoke('save-text', text),
  getText: () => ipcRenderer.invoke('get-text'),
  onLoadSettings: (callback) => ipcRenderer.on('load-settings', (event, settings) => callback(settings)),
  
  // Window management
  openEditor: () => ipcRenderer.invoke('open-editor'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  togglePrompterVisibility: () => ipcRenderer.invoke('toggle-prompter-visibility'),
  
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (content) => ipcRenderer.invoke('save-file-dialog', content),
  onUpdateText: (callback) => ipcRenderer.on('update-text', (event, text) => callback(text)),
  updatePrompterText: (text) => ipcRenderer.invoke('update-prompter-text', text),
  
  // Shortcuts (will be implemented in Phase 4)
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut-speed-increase', () => callback('speed-increase'))
    ipcRenderer.on('shortcut-speed-decrease', () => callback('speed-decrease'))
    ipcRenderer.on('shortcut-toggle-play', () => callback('toggle-play'))
    ipcRenderer.on('shortcut-reset', () => callback('reset'))
  },
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})
