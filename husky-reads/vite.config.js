import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all backend API routes to FastAPI on port 8000
      '/login':   'http://localhost:8000',
      '/signup':  'http://localhost:8000',
      '/search':  'http://localhost:8000',
      '/book':    'http://localhost:8000',
      '/user':    'http://localhost:8000',
    }
  }
})
