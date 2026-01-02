import { dialog } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'

const SCRIPTS_DIR = join(homedir(), 'Documents', 'Notchie')

// Ensure scripts directory exists
async function ensureScriptsDir() {
  if (!existsSync(SCRIPTS_DIR)) {
    await mkdir(SCRIPTS_DIR, { recursive: true })
  }
}

export async function openFileDialog() {
  const result = await dialog.showOpenDialog({
    title: 'Otwórz plik tekstowy',
    filters: [
      { name: 'Pliki tekstowe', extensions: ['txt'] },
      { name: 'Wszystkie pliki', extensions: ['*'] }
    ],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  try {
    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    return { filePath, content }
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
}

export async function saveFileDialog(content) {
  const result = await dialog.showSaveDialog({
    title: 'Zapisz skrypt',
    defaultPath: join(SCRIPTS_DIR, 'skrypt.txt'),
    filters: [
      { name: 'Pliki tekstowe', extensions: ['txt'] },
      { name: 'Wszystkie pliki', extensions: ['*'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  try {
    await writeFile(result.filePath, content, 'utf-8')
    return result.filePath
  } catch (error) {
    console.error('Error saving file:', error)
    throw error
  }
}

export async function readTextFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
}

export async function writeTextFile(filePath, content) {
  try {
    await ensureScriptsDir()
    const fullPath = filePath.startsWith(SCRIPTS_DIR) 
      ? filePath 
      : join(SCRIPTS_DIR, filePath)
    await writeFile(fullPath, content, 'utf-8')
    return fullPath
  } catch (error) {
    console.error('Error writing file:', error)
    throw error
  }
}
