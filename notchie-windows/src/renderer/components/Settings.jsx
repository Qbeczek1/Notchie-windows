import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'

function Settings() {
  const {
    fontSize,
    fontFamily,
    scrollSpeed,
    opacity,
    windowWidth,
    windowHeight,
    setFontSize,
    setFontFamily,
    setScrollSpeed,
    setOpacity,
    setWindowWidth,
    setWindowHeight,
    updateSettings
  } = useStore()

  const [localSettings, setLocalSettings] = useState({
    fontSize,
    fontFamily,
    scrollSpeed,
    opacity,
    windowWidth,
    windowHeight
  })

  // Sync with store
  useEffect(() => {
    setLocalSettings({
      fontSize,
      fontFamily,
      scrollSpeed,
      opacity,
      windowWidth,
      windowHeight
    })
  }, [fontSize, fontFamily, scrollSpeed, opacity, windowWidth, windowHeight])

  // Load settings from electron-store on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings()
        if (settings) {
          setLocalSettings(prev => ({ ...prev, ...settings }))
          updateSettings(settings)
        }
      }
    }
    loadSettings()
  }, [updateSettings])

  // Save settings when they change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSettings(localSettings)
      if (window.electronAPI) {
        window.electronAPI.saveSettings(localSettings)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSettings, updateSettings])

  const handleReset = () => {
    const defaults = {
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      scrollSpeed: 2,
      opacity: 0.9,
      windowWidth: 600,
      windowHeight: 150
    }
    setLocalSettings(defaults)
    updateSettings(defaults)
    if (window.electronAPI) {
      window.electronAPI.saveSettings(defaults)
    }
  }

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    
    // Update store immediately for live preview
    switch (key) {
      case 'fontSize':
        setFontSize(value)
        break
      case 'fontFamily':
        setFontFamily(value)
        break
      case 'scrollSpeed':
        setScrollSpeed(value)
        break
      case 'opacity':
        setOpacity(value)
        break
      case 'windowWidth':
        setWindowWidth(value)
        break
      case 'windowHeight':
        setWindowHeight(value)
        break
      default:
        break
    }
  }

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ustawienia Notchie</h1>

        {/* Font Size */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Rozmiar czcionki: {localSettings.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="48"
            value={localSettings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Font Family */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Rodzina czcionki
          </label>
          <select
            value={localSettings.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Segoe UI', sans-serif">Segoe UI</option>
            <option value="'Roboto', sans-serif">Roboto</option>
          </select>
        </div>

        {/* Scroll Speed */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Prędkość przewijania: {localSettings.scrollSpeed.toFixed(1)} px/frame
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={localSettings.scrollSpeed}
            onChange={(e) => handleChange('scrollSpeed', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Przezroczystość tła: {Math.round(localSettings.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={localSettings.opacity}
            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Window Dimensions */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Wymiary okna
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Szerokość (px)</label>
              <input
                type="number"
                min="200"
                max="2000"
                value={localSettings.windowWidth}
                onChange={(e) => handleChange('windowWidth', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Wysokość (px)</label>
              <input
                type="number"
                min="50"
                max="1000"
                value={localSettings.windowHeight}
                onChange={(e) => handleChange('windowHeight', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Resetuj do domyślnych
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
