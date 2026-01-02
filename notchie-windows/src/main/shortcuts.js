import { globalShortcut } from 'electron'
import { getPrompterWindow } from './windowManager.js'

let shortcutsRegistered = false

export function registerGlobalShortcuts() {
  if (shortcutsRegistered) {
    return
  }

  const prompterWindow = getPrompterWindow()
  if (!prompterWindow) {
    console.warn('Cannot register shortcuts: prompter window not found')
    return
  }

  // Shift+Right = increase speed
  const speedIncrease = globalShortcut.register('Shift+Right', () => {
    prompterWindow.webContents.send('shortcut-speed-increase')
  })

  // Shift+Left = decrease speed
  const speedDecrease = globalShortcut.register('Shift+Left', () => {
    prompterWindow.webContents.send('shortcut-speed-decrease')
  })

  // Shift+Space = play/pause toggle
  const togglePlay = globalShortcut.register('Shift+Space', () => {
    prompterWindow.webContents.send('shortcut-toggle-play')
  })

  // Shift+Up = reset to beginning
  const reset = globalShortcut.register('Shift+Up', () => {
    prompterWindow.webContents.send('shortcut-reset')
  })

  if (!speedIncrease || !speedDecrease || !togglePlay || !reset) {
    console.warn('Some shortcuts could not be registered')
  } else {
    shortcutsRegistered = true
    console.log('Global shortcuts registered successfully')
  }
}

export function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll()
  shortcutsRegistered = false
  console.log('Global shortcuts unregistered')
}
