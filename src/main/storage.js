import Store from 'electron-store'
import { DEFAULT_SETTINGS } from './constants.js'
import { createLogger } from './utils/logger.js'
import { validateText, validateFontSize, validateFontFamily, validateScrollSpeed, validateOpacity, validateWindowWidth, validateWindowHeight } from './utils/validators.js'

const logger = createLogger('Storage')

const store = new Store({
  defaults: {
    // Text
    lastScript: '',
    
    // Scroll settings
    scrollSpeed: DEFAULT_SETTINGS.scrollSpeed,
    
    // Display settings
    fontSize: DEFAULT_SETTINGS.fontSize,
    fontFamily: DEFAULT_SETTINGS.fontFamily,
    opacity: DEFAULT_SETTINGS.opacity,
    
    // Window settings
    windowWidth: DEFAULT_SETTINGS.windowWidth,
    windowHeight: DEFAULT_SETTINGS.windowHeight,
    windowX: undefined,
    windowY: undefined
  }
})

export function getSettings() {
  try {
    return {
      text: validateText(store.get('lastScript')),
      scrollSpeed: validateScrollSpeed(store.get('scrollSpeed')),
      fontSize: validateFontSize(store.get('fontSize')),
      fontFamily: validateFontFamily(store.get('fontFamily')),
      opacity: validateOpacity(store.get('opacity')),
      windowWidth: validateWindowWidth(store.get('windowWidth')),
      windowHeight: validateWindowHeight(store.get('windowHeight'))
    }
  } catch (error) {
    logger.error('Error getting settings:', error)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    logger.warn('Invalid settings object provided')
    return
  }

  try {
    if (settings.text !== undefined) {
      store.set('lastScript', validateText(settings.text))
    }
    if (settings.scrollSpeed !== undefined) {
      store.set('scrollSpeed', validateScrollSpeed(settings.scrollSpeed))
    }
    if (settings.fontSize !== undefined) {
      store.set('fontSize', validateFontSize(settings.fontSize))
    }
    if (settings.fontFamily !== undefined) {
      store.set('fontFamily', validateFontFamily(settings.fontFamily))
    }
    if (settings.opacity !== undefined) {
      store.set('opacity', validateOpacity(settings.opacity))
    }
    if (settings.windowWidth !== undefined) {
      store.set('windowWidth', validateWindowWidth(settings.windowWidth))
    }
    if (settings.windowHeight !== undefined) {
      store.set('windowHeight', validateWindowHeight(settings.windowHeight))
    }
    logger.debug('Settings saved successfully')
  } catch (error) {
    logger.error('Error saving settings:', error)
    throw error
  }
}

export function saveText(text) {
  try {
    const validatedText = validateText(text)
    store.set('lastScript', validatedText)
    logger.debug('Text saved successfully')
  } catch (error) {
    logger.error('Error saving text:', error)
    throw error
  }
}

export function getText() {
  try {
    return validateText(store.get('lastScript'))
  } catch (error) {
    logger.error('Error getting text:', error)
    return ''
  }
}

export default store
