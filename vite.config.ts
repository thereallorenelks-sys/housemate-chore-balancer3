import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vercel uses "/" — GitHub Pages serves from "/<repo>/"
  base: process.env.GITHUB_PAGES ? '/housemate-chore-balancer3/' : '/',
})
