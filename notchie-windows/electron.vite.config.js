import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcssPostcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'index.js',
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src/renderer')
      }
    },
    css: {
      postcss: {
        plugins: [
          tailwindcssPostcss,
          autoprefixer
        ]
      }
    }
  }
})
