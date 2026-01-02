import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Text state
  text: 'To jest przykładowy tekst telepromptera. Przeciągnij to okno do pozycji kamery.',
  
  // Scroll state
  scrollPosition: 0,
  isPlaying: false,
  scrollSpeed: 1, // px per frame (60 FPS)
  
  // Display settings
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  opacity: 0.9,
  
  // Window settings
  windowWidth: 600,
  windowHeight: 150,
  
  // Actions
  setText: (text) => set({ text, scrollPosition: 0 }), // Reset scroll when text changes
  
  setScrollPosition: (position) => {
    if (typeof position === 'function') {
      set((state) => ({ scrollPosition: Math.max(0, position(state.scrollPosition)) }))
    } else {
      set({ scrollPosition: Math.max(0, position) })
    }
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setScrollSpeed: (speed) => set({ scrollSpeed: Math.max(0.2, Math.min(1.8, speed)) }),
  
  resetScroll: () => set({ scrollPosition: 0 }),
  
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
  
  // Individual setting updates
  setFontSize: (fontSize) => set({ fontSize: Math.max(12, Math.min(48, fontSize)) }),
  
  setFontFamily: (fontFamily) => set({ fontFamily }),
  
  setOpacity: (opacity) => set({ opacity: Math.max(0.1, Math.min(1, opacity)) }),
  
  setWindowWidth: (width) => set({ windowWidth: Math.max(200, Math.min(2000, width)) }),
  
  setWindowHeight: (height) => set({ windowHeight: Math.max(50, Math.min(1000, height)) })
}))

export default useStore
