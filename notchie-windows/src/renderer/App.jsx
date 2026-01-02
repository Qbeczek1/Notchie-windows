import React from 'react'
import Prompter from './components/Prompter'
import Editor from './components/Editor'
import Settings from './components/Settings'
import About from './components/About'

function App() {
  // Check which view to show based on hash
  const hash = window.location.hash

  if (hash === '#/editor') {
    return <Editor />
  }

  if (hash === '#/settings') {
    return <Settings />
  }

  if (hash === '#/about') {
    return <About />
  }

  return <Prompter />
}

export default App
