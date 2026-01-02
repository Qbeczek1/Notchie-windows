import { globalShortcut } from 'electron'
import { getPrompterWindow } from './windowManager.js'
import { SHORTCUT_KEYS, IPC_CHANNELS } from './constants.js'
import { createLogger } from './utils/logger.js'

const logger = createLogger('Shortcuts')

let shortcutsRegistered = false

export function registerGlobalShortcuts() {
  if (shortcutsRegistered) {
    logger.warn('Shortcuts already registered, skipping')
    return
  }

  const prompterWindow = getPrompterWindow()
  if (!prompterWindow) {
    logger.warn('Cannot register shortcuts: prompter window not found')
    return
  }

  try {
    // Shift+Right = increase speed
    const speedIncrease = globalShortcut.register(SHORTCUT_KEYS.SPEED_INCREASE, () => {
      prompterWindow.webContents.send(IPC_CHANNELS.SHORTCUT_SPEED_INCREASE)
    })

    // Shift+Left = decrease speed
    const speedDecrease = globalShortcut.register(SHORTCUT_KEYS.SPEED_DECREASE, () => {
      prompterWindow.webContents.send(IPC_CHANNELS.SHORTCUT_SPEED_DECREASE)
    })

    // Shift+Space = play/pause toggle
    const togglePlay = globalShortcut.register(SHORTCUT_KEYS.TOGGLE_PLAY, () => {
      prompterWindow.webContents.send(IPC_CHANNELS.SHORTCUT_TOGGLE_PLAY)
    })

    // Shift+Up = reset to beginning
    const reset = globalShortcut.register(SHORTCUT_KEYS.RESET, () => {
      prompterWindow.webContents.send(IPC_CHANNELS.SHORTCUT_RESET)
    })

    const allRegistered = speedIncrease && speedDecrease && togglePlay && reset

    if (!allRegistered) {
      logger.warn('Some shortcuts could not be registered')
      // Unregister any that were registered
      if (speedIncrease) globalShortcut.unregister(SHORTCUT_KEYS.SPEED_INCREASE)
      if (speedDecrease) globalShortcut.unregister(SHORTCUT_KEYS.SPEED_DECREASE)
      if (togglePlay) globalShortcut.unregister(SHORTCUT_KEYS.TOGGLE_PLAY)
      if (reset) globalShortcut.unregister(SHORTCUT_KEYS.RESET)
      shortcutsRegistered = false
    } else {
      shortcutsRegistered = true
      logger.info('Global shortcuts registered successfully')
    }
  } catch (error) {
    logger.error('Error registering shortcuts:', error)
    shortcutsRegistered = false
  }
}

export function unregisterGlobalShortcuts() {
  try {
    globalShortcut.unregisterAll()
    shortcutsRegistered = false
    logger.info('Global shortcuts unregistered')
  } catch (error) {
    logger.error('Error unregistering shortcuts:', error)
  }
}
