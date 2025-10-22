import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    proxy: {
      // todo lo que empiece con /api se envía al backend
      '/api': {
        target: 'http://localhost:8080',   // <-- tu Spring Boot
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
