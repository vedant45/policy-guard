import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'wss://sentari.onrender.com',
      '/ws': {
        target: 'wss://sentari.onrender.com',
        ws: true,
      }
    }
  }
})