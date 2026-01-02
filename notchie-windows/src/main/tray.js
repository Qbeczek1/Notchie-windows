import { Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPrompterWindow } from './windowManager.js'
import { createEditorWindow } from './editorWindow.js'
import { createSettingsWindow } from './settingsWindow.js'
import { app } from 'electron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let tray = null

export function createTray() {
  // Create a simple icon (in production, use a proper .ico file)
  // For now, we'll create a simple icon programmatically
  const iconPath = path.join(__dirname, '../../public/icon.png')
  
  // Try to load icon, fallback to default if not found
  let icon
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      // Create a simple 16x16 icon if file doesn't exist
      icon = nativeImage.createEmpty()
    }
  } catch (error) {
    // Create empty icon as fallback
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)

  // Set tooltip
  tray.setToolTip('Notchie - Teleprompter')

  // Create context menu
  updateTrayMenu()

  // Handle click (left click - toggle window)
  tray.on('click', () => {
    const prompterWindow = getPrompterWindow()
    if (prompterWindow) {
      if (prompterWindow.isVisible()) {
        prompterWindow.hide()
      } else {
        prompterWindow.show()
      }
    }
  })

  return tray
}

function updateTrayMenu() {
  if (!tray) return

  const prompterWindow = getPrompterWindow()
  const isVisible = prompterWindow ? prompterWindow.isVisible() : false

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Ukryj Prompter' : 'Pokaż Prompter',
      click: () => {
        const window = getPrompterWindow()
        if (window) {
          if (window.isVisible()) {
            window.hide()
          } else {
            window.show()
          }
          // Update menu after toggle
          setTimeout(updateTrayMenu, 100)
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Otwórz Edytor',
      click: () => {
        createEditorWindow()
      }
    },
    {
      label: 'Ustawienia',
      click: () => {
        createSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Zamknij',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

export function getTray() {
  return tray
}

// Update menu when window visibility changes
export function refreshTrayMenu() {
  updateTrayMenu()
}
