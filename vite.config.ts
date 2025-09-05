import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from /<repo>/ — Vercel serves from /
  base: process.env.GITHUB_PAGES ? '/housemate-chore-balancer3/' : '/',
})
