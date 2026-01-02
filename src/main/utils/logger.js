/**
 * Centralized logging utility
 * Provides structured logging with levels and context
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

class Logger {
  constructor(context = 'App') {
    this.context = context
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  _log(level, message, ...args) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(prefix, message, ...args)
        break
      case LOG_LEVELS.WARN:
        console.warn(prefix, message, ...args)
        break
      case LOG_LEVELS.INFO:
        if (this.isDevelopment) {
          console.info(prefix, message, ...args)
        }
        break
      case LOG_LEVELS.DEBUG:
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args)
        }
        break
      default:
        console.log(prefix, message, ...args)
    }
  }

  error(message, ...args) {
    this._log(LOG_LEVELS.ERROR, message, ...args)
  }

  warn(message, ...args) {
    this._log(LOG_LEVELS.WARN, message, ...args)
  }

  info(message, ...args) {
    this._log(LOG_LEVELS.INFO, message, ...args)
  }

  debug(message, ...args) {
    this._log(LOG_LEVELS.DEBUG, message, ...args)
  }
}

export function createLogger(context) {
  return new Logger(context)
}

export const logger = createLogger('Main')
