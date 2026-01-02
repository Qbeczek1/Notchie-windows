import React, { useState, useEffect } from 'react'

function About() {
  const [appInfo, setAppInfo] = useState({
    name: 'Notchie',
    version: '1.0.0',
    author: 'Notchie',
    license: 'MIT',
    description: 'Teleprompter dla Windows'
  })

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onAppInfo) {
      const cleanup = window.electronAPI.onAppInfo((info) => {
        if (info) {
          setAppInfo(info)
        }
      })
      return cleanup || undefined
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{appInfo.name}</h1>
          <p className="text-gray-400 text-lg">{appInfo.description}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informacje o aplikacji</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-400">Wersja:</dt>
                <dd className="font-mono">{appInfo.version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Autor:</dt>
                <dd>{appInfo.author}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Licencja:</dt>
                <dd>{appInfo.license}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-4">Opis</h2>
            <p className="text-gray-300 leading-relaxed">
              {appInfo.description} - overlay wyświetlający tekst podczas nagrywania video.
              Aplikacja umożliwia wyświetlanie skryptu w pozycji kamery, automatyczne przewijanie tekstu
              oraz kontrolę za pomocą skrótów klawiszowych.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-4">GitHub</h2>
            <p className="text-gray-300">
              <a 
                href="https://github.com/Qbeczek1/Notchie-windows" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={(e) => {
                  // Validate URL before opening
                  const url = e.currentTarget.href
                  if (url && (url.startsWith('https://github.com/') || url.startsWith('http://github.com/'))) {
                    // Allow navigation
                  } else {
                    e.preventDefault()
                    console.error('Invalid URL:', url)
                  }
                }}
              >
                https://github.com/Qbeczek1/Notchie-windows
              </a>
            </p>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-4">Skróty klawiszowe</h2>
            <ul className="space-y-2 text-gray-300">
              <li><kbd className="px-2 py-1 bg-gray-700 rounded">Shift + Space</kbd> - Play/Pause</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded">Shift + →</kbd> - Zwiększ prędkość</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded">Shift + ←</kbd> - Zmniejsz prędkość</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded">Shift + ↑</kbd> - Reset do początku</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {appInfo.author}</p>
        </div>
      </div>
    </div>
  )
}

export default About

