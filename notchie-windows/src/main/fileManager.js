import { dialog, BrowserWindow } from 'electron'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'
import { FILE_CONFIG } from './constants.js'
import { createLogger } from './utils/logger.js'
import { validateText } from './utils/validators.js'

const logger = createLogger('FileManager')

const SCRIPTS_DIR = join(homedir(), 'Documents', FILE_CONFIG.SCRIPTS_DIR_NAME)

// Ensure scripts directory exists
async function ensureScriptsDir() {
  if (!existsSync(SCRIPTS_DIR)) {
    await mkdir(SCRIPTS_DIR, { recursive: true })
  }
}

export async function openFileDialog(parentWindow = null) {
  try {
    logger.info('Opening file dialog', { hasParentWindow: !!parentWindow })
    
    // Get focused window if no parent provided
    const window = parentWindow || BrowserWindow.getFocusedWindow()
    
    const result = await dialog.showOpenDialog(window, {
      title: 'Otwórz plik tekstowy',
      filters: [
        { name: 'Pliki tekstowe', extensions: FILE_CONFIG.SUPPORTED_EXTENSIONS },
        { name: 'Wszystkie pliki', extensions: ['*'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      logger.debug('File dialog canceled')
      return null
    }

    const filePath = result.filePaths[0]
    
    // Check file size before reading
    const stats = await stat(filePath)
    if (stats.size > FILE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`Plik jest zbyt duży. Maksymalny rozmiar: ${FILE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    const content = await readFile(filePath, 'utf-8')
    const validatedContent = validateText(content)
    
    logger.info(`File opened: ${filePath} (${stats.size} bytes)`)
    return { filePath, content: validatedContent }
  } catch (error) {
    logger.error('Error opening file:', error)
    throw error
  }
}

export async function saveFileDialog(content, parentWindow = null) {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string')
  }

  try {
    const validatedContent = validateText(content)
    
    // Get focused window if no parent provided
    const window = parentWindow || BrowserWindow.getFocusedWindow()
    
    const result = await dialog.showSaveDialog(window, {
      title: 'Zapisz skrypt',
      defaultPath: join(SCRIPTS_DIR, FILE_CONFIG.DEFAULT_SCRIPT_NAME),
      filters: [
        { name: 'Pliki tekstowe', extensions: FILE_CONFIG.SUPPORTED_EXTENSIONS },
        { name: 'Wszystkie pliki', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      logger.debug('Save dialog canceled')
      return null
    }

    await writeFile(result.filePath, validatedContent, 'utf-8')
    logger.info(`File saved: ${result.filePath}`)
    return result.filePath
  } catch (error) {
    logger.error('Error saving file:', error)
    throw error
  }
}

export async function readTextFile(filePath) {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path')
    }
    
    const content = await readFile(filePath, 'utf-8')
    return validateText(content)
  } catch (error) {
    logger.error('Error reading file:', error)
    throw error
  }
}

export async function writeTextFile(filePath, content) {
  try {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string')
    }
    
    await ensureScriptsDir()
    const validatedContent = validateText(content)
    const fullPath = filePath.startsWith(SCRIPTS_DIR) 
      ? filePath 
      : join(SCRIPTS_DIR, filePath)
    await writeFile(fullPath, validatedContent, 'utf-8')
    logger.info(`Text file written: ${fullPath}`)
    return fullPath
  } catch (error) {
    logger.error('Error writing file:', error)
    throw error
  }
}
