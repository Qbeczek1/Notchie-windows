import { desktopCapturer } from 'electron'
import { getPrompterWindow } from './windowManager.js'
import { SCREEN_SHARE_CONFIG } from './constants.js'
import { createLogger } from './utils/logger.js'

const logger = createLogger('ScreenShare')

let detectionInterval = null
let wasSharing = false

/**
 * Detect if screen sharing is active
 * Note: This is a basic implementation. Screen share detection in Electron
 * is limited and may not work perfectly in all scenarios.
 */
async function detectScreenShare() {
  try {
    const prompterWindow = getPrompterWindow()
    if (!prompterWindow) {
      return
    }

    // Get all available sources
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: SCREEN_SHARE_CONFIG.THUMBNAIL_SIZE
    })

    // Check if any screen source is being captured
    // This is a heuristic approach - we check if there are multiple screen sources
    // or if there are window sources that might indicate screen sharing
    const screenSources = sources.filter(source => 
      source.id.startsWith('screen:') || source.name.toLowerCase().includes('screen')
    )

    // Basic heuristic: if we detect screen sources, assume screen sharing might be active
    // This is not perfect but works for common cases
    const isSharing = screenSources.length > 0

    // Only toggle if state changed
    if (isSharing !== wasSharing) {
      wasSharing = isSharing
      
      if (isSharing) {
        // Hide prompter window
        prompterWindow.hide()
        logger.debug('Screen share detected - hiding prompter window')
      } else {
        // Show prompter window
        prompterWindow.show()
        logger.debug('Screen share ended - showing prompter window')
      }
    }
  } catch (error) {
    console.error('Error detecting screen share:', error)
  }
}

/**
 * Start screen share detection
 * @param {number} intervalMs - Detection interval in milliseconds (default: from config)
 */
export function startScreenShareDetection(intervalMs = SCREEN_SHARE_CONFIG.DETECTION_INTERVAL_MS) {
  if (detectionInterval) {
    logger.warn('Screen share detection already running, stopping first')
    stopScreenShareDetection()
  }

  try {
    // Initial detection
    detectScreenShare()

    // Set up interval
    detectionInterval = setInterval(() => {
      detectScreenShare()
    }, intervalMs)
    
    logger.info(`Screen share detection started (interval: ${intervalMs}ms)`)
  } catch (error) {
    logger.error('Error starting screen share detection:', error)
  }
}

/**
 * Stop screen share detection
 */
export function stopScreenShareDetection() {
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
    wasSharing = false
    logger.info('Screen share detection stopped')
  }
}

/**
 * Manually toggle prompter window visibility
 * Useful as a fallback if automatic detection doesn't work
 */
export function togglePrompterVisibility() {
  const prompterWindow = getPrompterWindow()
  if (prompterWindow) {
    try {
      if (prompterWindow.isVisible()) {
        prompterWindow.hide()
        logger.debug('Prompter window hidden')
      } else {
        prompterWindow.show()
        logger.debug('Prompter window shown')
      }
    } catch (error) {
      logger.error('Error toggling prompter visibility:', error)
    }
  } else {
    logger.warn('Cannot toggle visibility: prompter window not found')
  }
}
