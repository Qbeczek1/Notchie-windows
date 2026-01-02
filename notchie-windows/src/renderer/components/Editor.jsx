import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'

function Editor() {
  const { text, setText } = useStore()
  const [localText, setLocalText] = useState(text)
  const [isSaving, setIsSaving] = useState(false)
  const [apiReady, setApiReady] = useState(false)

  // Wait for electronAPI to be available
  useEffect(() => {
    const checkAPI = () => {
      if (window.electronAPI) {
        console.log('electronAPI is available')
        setApiReady(true)
        return true
      }
      return false
    }

    if (checkAPI()) {
      return
    }

    // Retry a few times if API is not ready
    let retries = 0
    const maxRetries = 10
    const interval = setInterval(() => {
      if (checkAPI() || retries >= maxRetries) {
        clearInterval(interval)
        if (!window.electronAPI) {
          console.error('electronAPI not available after retries')
        }
      }
      retries++
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Sync with store
  useEffect(() => {
    setLocalText(text)
  }, [text])

  // Update store when local text changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localText !== text) {
        setText(localText)
        // Also send to main process for prompter window update
        if (window.electronAPI && window.electronAPI.updatePrompterText) {
          window.electronAPI.updatePrompterText(localText)
        }
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [localText, text, setText])

  // Listen for text updates from main process
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onUpdateText) {
      window.electronAPI.onUpdateText((newText) => {
        setLocalText(newText)
        setText(newText)
      })
    }
  }, [setText])

  const handleLoadFile = async () => {
    if (!apiReady || !window.electronAPI) {
      console.error('electronAPI not available', { apiReady, electronAPI: !!window.electronAPI })
      alert('Błąd: Brak dostępu do API aplikacji. Spróbuj ponownie za chwilę.')
      return
    }

    try {
      console.log('Opening file dialog...')
      const result = await window.electronAPI.openFileDialog()
      console.log('File dialog result:', result)
      
      if (result && result.content) {
        const loadedText = result.content
        setLocalText(loadedText)
        setText(loadedText)
        // Immediately send to prompter window
        if (window.electronAPI && window.electronAPI.updatePrompterText) {
          window.electronAPI.updatePrompterText(loadedText).catch((error) => {
            console.error('Error updating prompter text:', error)
          })
        }
        console.log('File loaded successfully')
      } else if (result && result.error) {
        alert(`Błąd podczas wczytywania pliku: ${result.message || result.error}`)
      } else if (result === null) {
        // User canceled - no action needed
        console.log('File dialog canceled by user')
      } else {
        console.warn('Unexpected result:', result)
      }
    } catch (error) {
      console.error('Error loading file:', error)
      alert(`Błąd podczas wczytywania pliku: ${error.message}`)
    }
  }

  const handleSaveFile = async () => {
    if (!apiReady || !window.electronAPI) {
      console.error('electronAPI not available', { apiReady, electronAPI: !!window.electronAPI })
      alert('Błąd: Brak dostępu do API aplikacji. Spróbuj ponownie za chwilę.')
      return
    }

    setIsSaving(true)
    try {
      const result = await window.electronAPI.saveFileDialog(localText)
      if (result && result.error) {
        alert(`Błąd podczas zapisywania pliku: ${result.error}`)
      } else if (result) {
        alert(`Plik zapisany: ${result}`)
      }
    } catch (error) {
      alert(`Błąd podczas zapisywania pliku: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={handleLoadFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Wczytaj z pliku
        </button>
        <button
          onClick={handleSaveFile}
          disabled={isSaving}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz do pliku'}
        </button>
        <div className="ml-auto text-sm text-gray-500">
          {localText.length} znaków
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        className="flex-1 w-full p-4 border-0 resize-none focus:outline-none focus:ring-0 font-mono text-sm"
        placeholder="Wpisz lub wklej tutaj swój skrypt..."
        style={{ fontFamily: 'monospace' }}
      />
    </div>
  )
}

export default Editor
