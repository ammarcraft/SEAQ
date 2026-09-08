import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/searoutes': {
        target: 'https://api.searoutes.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/searoutes/, ''),
      },
      '/api/climatiq': {
        target: 'https://api.climatiq.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/climatiq/, ''),
      },
      '/api/eia': {
        target: 'https://api.eia.gov',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/eia/, ''),
      },
      '/api/stormglass': {
        target: 'https://api.stormglass.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/stormglass/, ''),
      },
    },
  },
})
