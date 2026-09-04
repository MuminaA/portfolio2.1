import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The large chunk is three.js, which is already split out behind a dynamic
    // import in App.tsx and is not on the critical path.
    chunkSizeWarningLimit: 1000,
  },
})
