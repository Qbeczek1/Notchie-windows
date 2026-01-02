import { useEffect, useRef, useState } from 'react'
import useStore from '../store/useStore'

export function useScroll() {
  const { 
    text, 
    scrollPosition, 
    isPlaying, 
    scrollSpeed,
    setScrollPosition
  } = useStore()
  
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll animation
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
      return
    }

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
        // Don't limit scroll - let it scroll beyond text (user can reset)
        return prev + scrollDelta
      })

      if (isPlaying && !isHovered) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [isPlaying, scrollSpeed, isHovered, setScrollPosition])

  // Manual scroll with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY
    setScrollPosition((prev) => Math.max(0, prev + delta * 0.5))
  }

  // Pause on hover
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return {
    handleWheel,
    handleMouseEnter,
    handleMouseLeave
  }
}
