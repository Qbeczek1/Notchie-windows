import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import useStore from '../store/useStore'
import { useScroll } from '../hooks/useScroll'

/**
 * Prompter Component - Main teleprompter display window
 * Displays scrolling text with customizable appearance
 */
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

  // Load settings from electron-store on mount (only once)
  useEffect(() => {
    let cleanup = null
    
    const loadSettings = async () => {
      if (!window.electronAPI) return
      
      try {
        const settings = await window.electronAPI.getSettings()
        if (settings) {
          updateSettings(settings)
        }
        
        // Listen for settings updates from main process
        cleanup = window.electronAPI.onLoadSettings((newSettings) => {
          if (newSettings) {
            updateSettings(newSettings)
          }
        })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    
    loadSettings()
    
    return () => {
      if (cleanup) cleanup()
    }
  }, []) // Empty deps - only run on mount

  // Save text when it changes (debounced)
  useEffect(() => {
    if (!window.electronAPI || !text) return
    
    const timeoutId = setTimeout(() => {
      window.electronAPI.saveText(text).catch((error) => {
        console.error('Error saving text:', error)
      })
    }, 500) // Debounce 500ms
    
    return () => clearTimeout(timeoutId)
  }, [text])

  // Handle global shortcuts with useCallback to prevent recreation
  const handleShortcut = useCallback((action) => {
    switch (action) {
      case 'speed-increase': {
        const newSpeed = scrollSpeed + 0.5
        setScrollSpeed(newSpeed)
        // Save to electron-store (fire and forget)
        window.electronAPI?.saveSettings({ scrollSpeed: newSpeed }).catch(console.error)
        break
      }
      case 'speed-decrease': {
        const newSpeed = Math.max(0.1, scrollSpeed - 0.5)
        setScrollSpeed(newSpeed)
        window.electronAPI?.saveSettings({ scrollSpeed: newSpeed }).catch(console.error)
        break
      }
      case 'toggle-play':
        togglePlay()
        break
      case 'reset':
        resetScroll()
        break
      default:
        break
    }
  }, [scrollSpeed, setScrollSpeed, togglePlay, resetScroll])

  useEffect(() => {
    if (!window.electronAPI) return

    const cleanup = window.electronAPI.onShortcut(handleShortcut)
    
    return cleanup || undefined
  }, [handleShortcut])

  // Memoize styles to prevent unnecessary recalculations
  const containerStyle = useMemo(() => ({
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    userSelect: 'none',
    WebkitAppRegion: 'drag'
  }), [opacity])

  const textStyle = useMemo(() => ({
    fontFamily: fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    transform: `translateY(-${scrollPosition}px)`,
    willChange: 'transform', // Optimize for animation
    transition: 'none' // Remove transition for smooth manual scroll
  }), [fontFamily, fontSize, scrollPosition])

  const displayText = text || 'Brak tekstu. Otwórz Edytor aby dodać skrypt.'

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
      style={containerStyle}
      onWheel={handleWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={textContainerRef}
        className="text-white px-8 py-4 text-center relative"
        style={textStyle}
      >
        {displayText}
        
        {/* Status indicator (only visible when playing) */}
        {isPlaying && (
          <div 
            className="absolute top-2 right-2 text-xs opacity-50 pointer-events-none"
            style={{ WebkitAppRegion: 'no-drag' }}
            aria-label={`Playing at speed ${scrollSpeed.toFixed(1)}x`}
          >
            ▶ {scrollSpeed.toFixed(1)}x
          </div>
        )}
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(Prompter)
