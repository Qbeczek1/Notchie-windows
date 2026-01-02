/**
 * Data validation utilities
 */

import { WINDOW_CONSTRAINTS } from '../constants.js'

/**
 * Validate and clamp window width
 * @param {number} width - Window width in pixels
 * @returns {number} Clamped width value
 */
export function validateWindowWidth(width) {
  const num = Number(width)
  if (isNaN(num)) {
    return WINDOW_CONSTRAINTS.MIN_WIDTH
  }
  return Math.max(
    WINDOW_CONSTRAINTS.MIN_WIDTH,
    Math.min(WINDOW_CONSTRAINTS.MAX_WIDTH, num)
  )
}

/**
 * Validate and clamp window height
 * @param {number} height - Window height in pixels
 * @returns {number} Clamped height value
 */
export function validateWindowHeight(height) {
  const num = Number(height)
  if (isNaN(num)) {
    return WINDOW_CONSTRAINTS.MIN_HEIGHT
  }
  return Math.max(
    WINDOW_CONSTRAINTS.MIN_HEIGHT,
    Math.min(WINDOW_CONSTRAINTS.MAX_HEIGHT, num)
  )
}

/**
 * Validate and clamp font size
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Clamped font size value
 */
export function validateFontSize(fontSize) {
  const num = Number(fontSize)
  if (isNaN(num)) {
    return WINDOW_CONSTRAINTS.MIN_FONT_SIZE
  }
  return Math.max(
    WINDOW_CONSTRAINTS.MIN_FONT_SIZE,
    Math.min(WINDOW_CONSTRAINTS.MAX_FONT_SIZE, num)
  )
}

/**
 * Validate and clamp scroll speed
 * @param {number} speed - Scroll speed
 * @returns {number} Clamped speed value
 */
export function validateScrollSpeed(speed) {
  const num = Number(speed)
  if (isNaN(num)) {
    return WINDOW_CONSTRAINTS.MIN_SCROLL_SPEED
  }
  return Math.max(
    WINDOW_CONSTRAINTS.MIN_SCROLL_SPEED,
    Math.min(WINDOW_CONSTRAINTS.MAX_SCROLL_SPEED, num)
  )
}

/**
 * Validate and clamp opacity
 * @param {number} opacity - Opacity value (0-1)
 * @returns {number} Clamped opacity value
 */
export function validateOpacity(opacity) {
  const num = Number(opacity)
  if (isNaN(num)) {
    return WINDOW_CONSTRAINTS.MIN_OPACITY
  }
  return Math.max(
    WINDOW_CONSTRAINTS.MIN_OPACITY,
    Math.min(WINDOW_CONSTRAINTS.MAX_OPACITY, num)
  )
}

/**
 * Validate font family string
 * @param {string} fontFamily - Font family string
 * @returns {string} Validated font family
 */
export function validateFontFamily(fontFamily) {
  if (typeof fontFamily !== 'string' || !fontFamily.trim()) {
    return 'Arial, sans-serif'
  }
  // Basic sanitization - remove potentially dangerous characters
  return fontFamily.replace(/[<>'"]/g, '').trim()
}

/**
 * Validate text content
 * @param {string} text - Text content
 * @returns {string} Validated text
 */
export function validateText(text) {
  if (typeof text !== 'string') {
    return ''
  }
  // Limit text length to prevent memory issues
  const MAX_LENGTH = 1000000 // 1M characters
  return text.length > MAX_LENGTH ? text.substring(0, MAX_LENGTH) : text
}
