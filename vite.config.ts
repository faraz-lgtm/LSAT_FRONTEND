import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { tanstackRouter } from '@tanstack/router-plugin/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,  
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'lecia-subaerial-dingily.ngrok-free.dev' //ngroks
    ],
    proxy: {
      '/api': {
        target: 'https://api.betterlsat.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@tanstack/router-devtools', 'googleapis', 'google-auth-library']
  },
  build: {
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'googleapis', 'google-auth-library'],
      output: {
        manualChunks: {
          // FullCalendar and its plugins (~250KB)
          'fullcalendar': [
            '@fullcalendar/react',
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
            '@fullcalendar/list',
            '@fullcalendar/multimonth',
            'fullcalendar'
          ],
          // Recharts charting library (~150KB)
          'recharts': ['recharts'],
          // TanStack Router (~100KB)
          'tanstack-router': [
            '@tanstack/react-router'
          ],
          // TanStack Table (~50KB)
          'tanstack-table': [
            '@tanstack/react-table'
          ],
          // Redux and related (~100KB)
          'redux': [
            '@reduxjs/toolkit',
            'react-redux',
            'redux-persist'
          ],
          // Radix UI - group larger components (~100KB)
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip'
          ],
          // PostHog analytics (~50KB)
          'posthog': ['posthog-js'],
          // Clerk authentication (~100KB)
          'clerk': ['@clerk/clerk-react'],
          // React Hook Form (~50KB)
          'react-hook-form': ['react-hook-form', '@hookform/resolvers'],
          // Lucide icons (~100KB+ depending on usage)
          'lucide-icons': ['lucide-react'],
          // Date utilities (~50KB)
          'date-fns': ['date-fns'],
          // Validation library (~50KB)
          'zod': ['zod'],
          // HTTP client (~30KB)
          'axios': ['axios'],
          // React Router (~100KB)
          'react-router': ['react-router-dom']
        }
      }
    }
  }
})


