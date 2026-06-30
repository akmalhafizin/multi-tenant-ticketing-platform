import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    // Listen on all interfaces so subdomains (lvh.me → 127.0.0.1) work
    host: '0.0.0.0',
    // Allow subdomain access via *.lvh.me and custom hosts
    allowedHosts: [
      '.lvh.me',     // any-subdomain.lvh.me
      '.localhost',  // any-subdomain.localhost
    ],
  },
})
