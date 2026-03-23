// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // ✅ IMPORTANTE: Deduplicate React
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ React + React-DOM insieme (NON separarli!)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'react-router'
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          
          // UI Libraries
          if (
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/sonner') ||
            id.includes('node_modules/@radix-ui')
          ) {
            return 'ui-libs'
          }
          
          // PDF Libraries
          if (
            id.includes('node_modules/jspdf') ||
            id.includes('node_modules/html2canvas')
          ) {
            return 'pdf-libs'
          }
          
          // Calendar Libraries
          if (
            id.includes('node_modules/react-big-calendar') ||
            id.includes('node_modules/date-fns')
          ) {
            return 'calendar-libs'
          }
          
          // Altre node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
   
    hmr: {
      overlay: false,
    },
  },
})