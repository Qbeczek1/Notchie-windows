import React, { useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import { useScroll } from '../hooks/useScroll'

function Prompter() {
  const { 
    text, 
    fontSize, 
    fontFamily, 
    opacity,
    scrollPosition,
    scrollSpeed,
    isPlaying,
    updateSettings,
    togglePlay,
    setScrollSpeed,
    resetScroll
  } = useStore()

  const textContainerRef = useRef(null)
  const { handleWheel, handleMouseEnter, handleMouseLeave } = useScroll()

  // Load settings from electron-store on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings()
        if (settings) {
          updateSettings(settings)
        }
        
        // Listen for settings updates from main process
        window.electronAPI.onLoadSettings((settings) => {
          updateSettings(settings)
        })
      }
    }
    
    loadSettings()
  }, [updateSettings])

  // Save text when it changes
  useEffect(() => {
    if (window.electronAPI && text) {
      window.electronAPI.saveText(text)
    }
  }, [text])

  // Handle global shortcuts
  useEffect(() => {
    if (!window.electronAPI) return

    const handleShortcut = (action) => {
      switch (action) {
        case 'speed-increase':
          const newSpeedIncrease = scrollSpeed + 0.5
          setScrollSpeed(newSpeedIncrease)
          // Save to electron-store
          if (window.electronAPI) {
            window.electronAPI.saveSettings({ scrollSpeed: newSpeedIncrease })
          }
          break
        case 'speed-decrease':
          const newSpeedDecrease = Math.max(0.1, scrollSpeed - 0.5)
          setScrollSpeed(newSpeedDecrease)
          // Save to electron-store
          if (window.electronAPI) {
            window.electronAPI.saveSettings({ scrollSpeed: newSpeedDecrease })
          }
          break
        case 'toggle-play':
          togglePlay()
          break
        case 'reset':
          resetScroll()
          break
        default:
          break
      }
    }

    window.electronAPI.onShortcut(handleShortcut)

    return () => {
      if (window.electronAPI && window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('shortcut-speed-increase')
        window.electronAPI.removeAllListeners('shortcut-speed-decrease')
        window.electronAPI.removeAllListeners('shortcut-toggle-play')
        window.electronAPI.removeAllListeners('shortcut-reset')
      }
    }
  }, [scrollSpeed, setScrollSpeed, togglePlay, resetScroll])

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        userSelect: 'none',
        WebkitAppRegion: 'drag'
      }}
      onWheel={handleWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={textContainerRef}
        className="text-white px-8 py-4 text-center relative"
        style={{
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          transform: `translateY(-${scrollPosition}px)`,
          willChange: 'transform', // Optimize for animation
          transition: 'none' // Remove transition for smooth manual scroll
        }}
      >
        {text || 'Brak tekstu. Otwórz Edytor aby dodać skrypt.'}
        
        {/* Status indicator (only visible on hover) */}
        {isPlaying && (
          <div 
            className="absolute top-2 right-2 text-xs opacity-50"
            style={{ WebkitAppRegion: 'no-drag' }}
          >
            ▶ {scrollSpeed.toFixed(1)}x
          </div>
        )}
      </div>
    </div>
  )
}

export default Prompter
