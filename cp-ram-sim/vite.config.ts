import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/cyberpunk2077-ram-simulator/',
  plugins: [
    tailwindcss(),
    react(),
  ],
})
