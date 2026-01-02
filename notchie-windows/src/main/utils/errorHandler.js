/**
 * Centralized error handling utilities
 */

import { createLogger } from './logger.js'

const logger = createLogger('ErrorHandler')

/**
 * Wrap async IPC handler with error handling
 * @param {Function} handler - Async IPC handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandling(handler) {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args)
    } catch (error) {
      logger.error('IPC handler error:', error)
      return {
        error: true,
        message: error.message || 'Unknown error occurred',
        code: error.code || 'UNKNOWN_ERROR'
      }
    }
  }
}

/**
 * Wrap sync IPC handler with error handling
 * @param {Function} handler - Sync IPC handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandlingSync(handler) {
  return (event, ...args) => {
    try {
      return handler(event, ...args)
    } catch (error) {
      logger.error('IPC handler error:', error)
      return {
        error: true,
        message: error.message || 'Unknown error occurred',
        code: error.code || 'UNKNOWN_ERROR'
      }
    }
  }
}

/**
 * Handle uncaught errors
 */
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
    // In production, might want to show user-friendly dialog
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })
}
