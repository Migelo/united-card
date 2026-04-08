import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'united-card-calculator' with your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/united-card-calculator/',
})
