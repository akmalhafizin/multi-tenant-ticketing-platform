import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so subdomains (lvh.me → 127.0.0.1) work
    host: '0.0.0.0',
    // Proxy API and upload requests to backend in dev mode
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    // Allow subdomain access via *.lvh.me and custom hosts
    allowedHosts: [
      '.lvh.me',     // any-subdomain.lvh.me
      '.localhost',  // any-subdomain.localhost
      '.trycloudflare.com', // cloudflare tunnels
    ],
  },
})
