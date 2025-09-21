import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    }
  },
  base:"/fst-tchat-front/",
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    passWithNoTests: true, // ✅ IMPORTANT
  }
})
