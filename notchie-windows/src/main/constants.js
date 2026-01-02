/**
 * Application constants and configuration
 */

// IPC Channel Names - centralized for type safety and maintainability
export const IPC_CHANNELS = {
  // Window management
  GET_WINDOW_BOUNDS: 'get-window-bounds',
  SET_WINDOW_BOUNDS: 'set-window-bounds',
  
  // Settings
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  SAVE_TEXT: 'save-text',
  GET_TEXT: 'get-text',
  LOAD_SETTINGS: 'load-settings',
  
  // File operations
  OPEN_FILE_DIALOG: 'open-file-dialog',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  
  // Window controls
  OPEN_EDITOR: 'open-editor',
  OPEN_SETTINGS: 'open-settings',
  TOGGLE_PROMPTER_VISIBILITY: 'toggle-prompter-visibility',
  
  // Shortcuts
  SHORTCUT_SPEED_INCREASE: 'shortcut-speed-increase',
  SHORTCUT_SPEED_DECREASE: 'shortcut-speed-decrease',
  SHORTCUT_TOGGLE_PLAY: 'shortcut-toggle-play',
  SHORTCUT_RESET: 'shortcut-reset',
  
  // Text updates
  UPDATE_TEXT: 'update-text',
  UPDATE_PROMPTER_TEXT: 'update-prompter-text',
  
  // Settings updates
  SETTINGS_UPDATED: 'settings-updated'
}

// Default application settings
export const DEFAULT_SETTINGS = {
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  scrollSpeed: 2,
  opacity: 0.9,
  windowWidth: 600,
  windowHeight: 150
}

// Window constraints
export const WINDOW_CONSTRAINTS = {
  MIN_WIDTH: 200,
  MAX_WIDTH: 2000,
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 1000,
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 48,
  MIN_SCROLL_SPEED: 0.1,
  MAX_SCROLL_SPEED: 10,
  MIN_OPACITY: 0.1,
  MAX_OPACITY: 1.0
}

// Screen share detection
export const SCREEN_SHARE_CONFIG = {
  DETECTION_INTERVAL_MS: 2000,
  THUMBNAIL_SIZE: { width: 1, height: 1 }
}

// File operations
export const FILE_CONFIG = {
  SCRIPTS_DIR_NAME: 'Notchie',
  DEFAULT_SCRIPT_NAME: 'skrypt.txt',
  SUPPORTED_EXTENSIONS: ['txt'],
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

// Shortcut keys
export const SHORTCUT_KEYS = {
  SPEED_INCREASE: 'Shift+Right',
  SPEED_DECREASE: 'Shift+Left',
  TOGGLE_PLAY: 'Shift+Space',
  RESET: 'Shift+Up'
}

// Animation
export const ANIMATION_CONFIG = {
  TARGET_FPS: 60,
  FRAME_TIME_MS: 1000 / 60 // ~16.67ms
}
