import { BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let aboutWindow = null

export function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus()
    return aboutWindow
  }

  // Preload path - check both .js and .mjs (electron-vite may output either)
  const preloadJsPath = path.resolve(__dirname, '../preload/index.js')
  const preloadMjsPath = path.resolve(__dirname, '../preload/index.mjs')
  
  let preloadPath
  if (existsSync(preloadJsPath)) {
    preloadPath = preloadJsPath
  } else if (existsSync(preloadMjsPath)) {
    preloadPath = preloadMjsPath
  } else {
    console.error('[AboutWindow] ERROR: Preload file not found!')
    console.error('[AboutWindow] Checked:', preloadJsPath)
    console.error('[AboutWindow] Checked:', preloadMjsPath)
    throw new Error(`Preload file not found. Checked: ${preloadJsPath} and ${preloadMjsPath}`)
  }

  // Set window icon
  const iconPath = path.join(__dirname, '../../src/images/favicon.ico')
  const icon = existsSync(iconPath) ? iconPath : undefined

  // Read package.json for app info
  let appInfo = {
    name: 'ScriptView',
    version: '1.0.0',
    author: 'ScriptView',
    license: 'MIT',
    description: 'Teleprompter dla Windows'
  }

  try {
    const packagePath = path.join(__dirname, '../../../package.json')
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
      appInfo = {
        name: packageJson.name || appInfo.name,
        version: packageJson.version || appInfo.version,
        author: packageJson.author || appInfo.author,
        license: packageJson.license || appInfo.license,
        description: packageJson.description || appInfo.description
      }
    }
  } catch (error) {
    console.error('[AboutWindow] Error reading package.json:', error)
  }

  aboutWindow = new BrowserWindow({
    width: 500,
    height: 400,
    title: 'O aplikacji - ScriptView',
    icon: icon,
    resizable: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Pass app info to renderer
  aboutWindow.webContents.once('did-finish-load', () => {
    aboutWindow.webContents.send('app-info', appInfo)
  })

  // Load about HTML
  if (process.env.ELECTRON_RENDERER_URL) {
    aboutWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/about`)
  } else {
    const htmlPath = path.join(__dirname, '../renderer/index.html')
    aboutWindow.loadFile(htmlPath).then(() => {
      // Set hash after load - use whitelisted hash value
      const allowedHash = '#/about'
      aboutWindow.webContents.executeJavaScript(`window.location.hash = ${JSON.stringify(allowedHash)}`)
    })
  }

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })

  return aboutWindow
}

export function getAboutWindow() {
  return aboutWindow
}

