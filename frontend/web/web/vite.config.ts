import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // TODO: убрать, когда 07-12-2025 frontend-main вольют в main, где будет фикс проблемы, для которой сейчас этот костыль
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:14000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})