import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use repo name when running on GitHub Actions, otherwise root
const base = process.env.GITHUB_ACTIONS ? '/housemate-chore-balancer3/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
