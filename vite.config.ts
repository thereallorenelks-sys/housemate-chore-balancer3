// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Detect hosting env
const isVercel = !!process.env.VERCEL;            // set by Vercel builds
const isGitHubActions = !!process.env.GITHUB_ACTIONS; // set by GitHub Pages workflow

// Your GitHub repo name (must match exactly)
const repoName = 'housemate-chore-balancer3';

export default defineConfig({
  plugins: [react()],
  // Use root base for Vercel, repo subpath for GitHub Pages
  base: isVercel ? '/' : (isGitHubActions ? `/${repoName}/` : '/'),
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
