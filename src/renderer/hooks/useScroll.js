import { useEffect, useRef, useState } from 'react'
import useStore from '../store/useStore'

export function useScroll() {
  const { 
    text, 
    scrollPosition, 
    isPlaying, 
    scrollSpeed,
    setScrollPosition,
    togglePlay
  } = useStore()
  
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const wasPlayingBeforeHoverRef = useRef(false)
  const isDraggingRef = useRef(false)


  // Auto-scroll animation
  useEffect(() => {
    console.log('[useScroll] Effect triggered', { isPlaying, isHovered, scrollSpeed })
    
    if (!isPlaying || isHovered) {
      console.log('[useScroll] Animation stopped', { isPlaying, isHovered })
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
      return
    }

    console.log('[useScroll] Starting animation')
    const animate = (currentTime) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      // Calculate scroll delta
      // scrollSpeed is in px per frame at 60 FPS (default 2)
      // Convert to px per ms: scrollSpeed * (1000ms / 60fps) = scrollSpeed * 16.67ms
      const scrollDelta = (scrollSpeed * deltaTime) / 16.67

      setScrollPosition((prev) => {
        const newPosition = prev + scrollDelta
        // Log every 60 frames (roughly once per second at 60fps)
        if (Math.floor(newPosition) % 60 === 0) {
          console.log('[useScroll] Scroll position:', newPosition.toFixed(2))
        }
        // Don't limit scroll - let it scroll beyond text (user can reset)
        return newPosition
      })

      if (isPlaying && !isHovered) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      console.log('[useScroll] Cleanup animation')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [isPlaying, scrollSpeed, isHovered, setScrollPosition, togglePlay])

  // Manual scroll with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY
    setScrollPosition((prev) => Math.max(0, prev + delta * 0.5))
  }

  // Auto-pause on hover (but not when dragging)
  const handleMouseEnter = () => {
    if (isDraggingRef.current) return // Don't pause if dragging
    
    // Only set wasPlayingBeforeHover if we're not already hovered
    // This prevents overwriting the flag when mouse moves between elements
    const wasAlreadyHovered = isHovered
    if (!wasAlreadyHovered) {
      wasPlayingBeforeHoverRef.current = isPlaying
      console.log('[useScroll] Mouse enter - isPlaying:', isPlaying, 'saved wasPlayingBeforeHover:', wasPlayingBeforeHoverRef.current)
    } else {
      console.log('[useScroll] Mouse enter - already hovered, isPlaying:', isPlaying, 'wasPlayingBeforeHover:', wasPlayingBeforeHoverRef.current)
    }
    
    setIsHovered(true)
    
    // Pause if currently playing (only on first hover)
    if (isPlaying && !wasAlreadyHovered) {
      console.log('[useScroll] Pausing on hover')
      togglePlay()
    }
  }

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      console.log('[useScroll] Mouse leave - dragging, not resuming')
      return // Don't resume if dragging
    }
    const shouldResume = wasPlayingBeforeHoverRef.current
    console.log('[useScroll] Mouse leave - wasPlayingBeforeHover:', shouldResume, 'current isPlaying:', isPlaying)
    
    // Clear hover state first
    setIsHovered(false)
    
    // Resume if it was playing before hover
    if (shouldResume) {
      // Use a small delay to ensure state updates are processed
      setTimeout(() => {
        // Check if we're still not dragging
        if (isDraggingRef.current) {
          console.log('[useScroll] Still dragging, not resuming')
          return
        }
        
        const currentState = useStore.getState()
        console.log('[useScroll] Mouse leave timeout - current isPlaying:', currentState.isPlaying)
        
        // Only resume if currently paused
        if (!currentState.isPlaying) {
          console.log('[useScroll] Resuming from mouse leave')
          currentState.togglePlay()
          wasPlayingBeforeHoverRef.current = false
        } else {
          console.log('[useScroll] Already playing, resetting flag')
          wasPlayingBeforeHoverRef.current = false
        }
      }, 150) // Increased delay to ensure state is updated
    } else {
      console.log('[useScroll] Should not resume - was not playing before hover')
    }
  }

  // Track mouse down/up for dragging detection
  const handleMouseDown = () => {
    isDraggingRef.current = true
    console.log('[useScroll] Mouse down - setting isDragging')
  }

  const handleMouseUp = () => {
    // Small delay to allow drag to complete
    setTimeout(() => {
      isDraggingRef.current = false
      console.log('[useScroll] Mouse up - clearing isDragging')
    }, 100)
  }

  return {
    handleWheel,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp
  }
}
