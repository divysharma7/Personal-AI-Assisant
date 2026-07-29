import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          // node_modules vendor splitting
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('/react-dom/') || id.includes('/react/')) {
              return 'vendor-react'
            }
            // Router
            if (id.includes('/react-router')) {
              return 'vendor-router'
            }
            // Animation
            if (id.includes('/framer-motion/')) {
              return 'vendor-framer-motion'
            }
            // Icons
            if (id.includes('/lucide-react/')) {
              return 'vendor-lucide'
            }
            // Data fetching
            if (id.includes('/@tanstack/react-query/')) {
              return 'vendor-react-query'
            }
            // Rich-text editor
            if (id.includes('/@tiptap/')) {
              return 'vendor-tiptap'
            }
            // Drag-and-drop
            if (id.includes('/@dnd-kit/')) {
              return 'vendor-dnd-kit'
            }
          }
        },
      },
    },
  },
})
