import Store from 'electron-store'

const store = new Store({
  defaults: {
    // Text
    lastScript: '',
    
    // Scroll settings
    scrollSpeed: 2,
    
    // Display settings
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    opacity: 0.9,
    
    // Window settings
    windowWidth: 600,
    windowHeight: 150,
    windowX: undefined,
    windowY: undefined
  }
})

export function getSettings() {
  return {
    text: store.get('lastScript'),
    scrollSpeed: store.get('scrollSpeed'),
    fontSize: store.get('fontSize'),
    fontFamily: store.get('fontFamily'),
    opacity: store.get('opacity'),
    windowWidth: store.get('windowWidth'),
    windowHeight: store.get('windowHeight')
  }
}

export function saveSettings(settings) {
  if (settings.text !== undefined) {
    store.set('lastScript', settings.text)
  }
  if (settings.scrollSpeed !== undefined) {
    store.set('scrollSpeed', settings.scrollSpeed)
  }
  if (settings.fontSize !== undefined) {
    store.set('fontSize', settings.fontSize)
  }
  if (settings.fontFamily !== undefined) {
    store.set('fontFamily', settings.fontFamily)
  }
  if (settings.opacity !== undefined) {
    store.set('opacity', settings.opacity)
  }
  if (settings.windowWidth !== undefined) {
    store.set('windowWidth', settings.windowWidth)
  }
  if (settings.windowHeight !== undefined) {
    store.set('windowHeight', settings.windowHeight)
  }
}

export function saveText(text) {
  store.set('lastScript', text)
}

export function getText() {
  return store.get('lastScript')
}

export default store
