import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { useScroll } from '../hooks/useScroll'
import { Edit, Settings, Info, Play, Pause } from 'lucide-react'

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
    setText,
    togglePlay,
    setScrollSpeed,
    resetScroll
  } = useStore()

  const textContainerRef = useRef(null)
  const { handleWheel, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp } = useScroll()
  const [showStatus, setShowStatus] = useState(false)
  const statusTimeoutRef = useRef(null)

  // Load settings from electron-store on mount (only once)
  useEffect(() => {
    let cleanup = null
    
    const loadSettings = async () => {
      if (!window.electronAPI) return
      
      try {
        const settings = await window.electronAPI.getSettings()
        if (settings) {
          // Only update text if it's not empty (preserve default text if storage is empty)
          const settingsToUpdate = { ...settings }
          if (!settingsToUpdate.text || settingsToUpdate.text.trim() === '') {
            delete settingsToUpdate.text // Don't overwrite default text
          }
          updateSettings(settingsToUpdate)
        }
        
        // Load saved text separately if it exists
        try {
          const savedText = await window.electronAPI.getText()
          if (savedText && savedText.trim() !== '') {
            setText(savedText)
          }
        } catch (error) {
          console.error('Error loading text:', error)
        }
        
        // Listen for settings updates from main process
        cleanup = window.electronAPI.onLoadSettings((newSettings) => {
          if (newSettings) {
            console.log('[Prompter] Received settings update:', newSettings)
            const settingsToUpdate = { ...newSettings }
            if (!settingsToUpdate.text || settingsToUpdate.text.trim() === '') {
              delete settingsToUpdate.text
            }
            updateSettings(settingsToUpdate)
            console.log('[Prompter] Settings updated in store')
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

  // Listen for text updates from editor
  useEffect(() => {
    if (!window.electronAPI || !window.electronAPI.onUpdateText) return
    
    const cleanup = window.electronAPI.onUpdateText((newText) => {
      if (newText !== undefined && newText !== null) {
        setText(newText)
        // Reset scroll position when text is updated
        resetScroll()
      }
    })
    
    return cleanup || undefined
  }, [setText, resetScroll])

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

  // Show status indicator when speed changes or play state changes
  useEffect(() => {
    setShowStatus(true)
    
    // Clear existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current)
    }
    
    // Hide status after 3 seconds if paused, keep showing if playing
    if (!isPlaying) {
      statusTimeoutRef.current = setTimeout(() => {
        setShowStatus(false)
      }, 3000)
    }
    
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current)
      }
    }
  }, [scrollSpeed, isPlaying])

  // Handle global shortcuts with useCallback to prevent recreation
  const handleShortcut = useCallback((action) => {
    switch (action) {
      case 'speed-increase': {
        const newSpeed = scrollSpeed + 0.1
        setScrollSpeed(newSpeed)
        // Save to electron-store (fire and forget)
        window.electronAPI?.saveSettings({ scrollSpeed: newSpeed }).catch(console.error)
        break
      }
      case 'speed-decrease': {
        const newSpeed = Math.max(0.1, scrollSpeed - 0.1)
        setScrollSpeed(newSpeed)
        window.electronAPI?.saveSettings({ scrollSpeed: newSpeed }).catch(console.error)
        break
      }
      case 'toggle-play':
        console.log('[Prompter] Toggle play - current state:', isPlaying)
        togglePlay()
        break
      case 'reset':
        resetScroll()
        break
      default:
        break
    }
  }, [scrollSpeed, isPlaying, setScrollSpeed, togglePlay, resetScroll])

  useEffect(() => {
    if (!window.electronAPI) return

    const cleanup = window.electronAPI.onShortcut(handleShortcut)
    
    return cleanup || undefined
  }, [handleShortcut])

  // Memoize styles to prevent unnecessary recalculations
  const containerStyle = useMemo(() => ({
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    userSelect: 'none',
    WebkitAppRegion: 'drag',
    pointerEvents: 'auto' // Ensure mouse events are captured
  }), [opacity])

  const textStyle = useMemo(() => ({
    fontFamily: fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    transform: `translateY(-${scrollPosition}px)`,
    willChange: 'transform', // Optimize for animation
    transition: 'none', // Remove transition for smooth manual scroll
    whiteSpace: 'pre-wrap' // Preserve empty lines and whitespace
  }), [fontFamily, fontSize, scrollPosition])

  const displayText = text || 'Brak tekstu. Otwórz Edytor aby dodać skrypt.'

  // Handle opening editor window
  const handleOpenEditor = useCallback(() => {
    if (window.electronAPI && window.electronAPI.openEditor) {
      window.electronAPI.openEditor().catch((error) => {
        console.error('Error opening editor:', error)
      })
    }
  }, [])

  // Handle opening settings window
  const handleOpenSettings = useCallback(() => {
    if (window.electronAPI && window.electronAPI.openSettings) {
      window.electronAPI.openSettings().catch((error) => {
        console.error('Error opening settings:', error)
      })
    }
  }, [])

  // Handle opening about window
  const handleOpenAbout = useCallback(() => {
    if (window.electronAPI && window.electronAPI.openAbout) {
      window.electronAPI.openAbout().catch((error) => {
        console.error('Error opening about:', error)
      })
    }
  }, [])

  return (
    <div 
      className="w-full h-full flex flex-col cursor-move relative"
      style={containerStyle}
      onWheel={handleWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Text container - takes available space */}
      <div 
        className="flex-1 flex justify-center overflow-hidden relative"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div 
          ref={textContainerRef}
          className="text-white px-8 py-4 text-center"
          style={{
            ...textStyle,
            alignSelf: 'flex-start',
            paddingTop: '20px',
            paddingBottom: '20px'
          }}
        >
          {displayText}
        </div>
        
        {/* Status indicator - fixed to top-right corner of window */}
        {showStatus && (
          <div 
            className="absolute text-xs opacity-70 text-white"
            style={{ 
              top: '8px',
              right: '8px',
              WebkitAppRegion: 'no-drag',
              zIndex: 1000,
              pointerEvents: 'auto' // Enable mouse events for hover detection
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label={isPlaying ? `Playing at speed ${scrollSpeed.toFixed(1)}x` : `Paused at speed ${scrollSpeed.toFixed(1)}x`}
          >
            {isPlaying ? '▶' : '⏸'} {scrollSpeed.toFixed(1)}x
          </div>
        )}

        {/* Control bar - fixed to right side */}
        <div 
          className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-4 px-2 py-4"
          style={{
            WebkitAppRegion: 'no-drag',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          {/* Editor button */}
          <button
            onClick={handleOpenEditor}
            className="p-3 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors duration-200 flex items-center justify-center"
            style={{
              WebkitAppRegion: 'no-drag',
              cursor: 'pointer'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Otwórz Edytor"
            title="Otwórz Edytor"
          >
            <Edit size={20} />
          </button>

          {/* Settings button */}
          <button
            onClick={handleOpenSettings}
            className="p-3 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors duration-200 flex items-center justify-center"
            style={{
              WebkitAppRegion: 'no-drag',
              cursor: 'pointer'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Otwórz Ustawienia"
            title="Otwórz Ustawienia"
          >
            <Settings size={20} />
          </button>

          {/* About button */}
          <button
            onClick={handleOpenAbout}
            className="p-3 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors duration-200 flex items-center justify-center"
            style={{
              WebkitAppRegion: 'no-drag',
              cursor: 'pointer'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="O aplikacji"
            title="O aplikacji"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Shortcuts info bar - at bottom, not overlay */}
      <div 
        className="flex items-center justify-center gap-6 px-4 py-2 bg-black/60 text-white text-xs flex-shrink-0"
        style={{
          WebkitAppRegion: 'no-drag',
          pointerEvents: 'auto'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="opacity-70">Play/Pause:</span>
          <kbd className="px-2 py-1 bg-black/50 rounded border border-white/20">Shift + Space</kbd>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-70">Speed +:</span>
          <kbd className="px-2 py-1 bg-black/50 rounded border border-white/20">Shift + →</kbd>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-70">Speed -:</span>
          <kbd className="px-2 py-1 bg-black/50 rounded border border-white/20">Shift + ←</kbd>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-70">Reset:</span>
          <kbd className="px-2 py-1 bg-black/50 rounded border border-white/20">Shift + ↑</kbd>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(Prompter)
