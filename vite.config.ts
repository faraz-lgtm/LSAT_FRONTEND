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
    exclude: ['@tanstack/router-devtools']
  },
  build: {
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
      output: {
        manualChunks: (id) => {
          // Vendor chunks - core React ecosystem
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
              return 'vendor-react';
            }
            
            // Clerk authentication
            if (id.includes('@clerk/')) {
              return 'vendor-clerk';
            }
            
            // Redux ecosystem
            if (id.includes('@reduxjs/') || id.includes('redux-persist') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            
            // TanStack Router
            if (id.includes('@tanstack/react-router')) {
              return 'vendor-router';
            }
            
            // FullCalendar - large library, split separately
            if (id.includes('@fullcalendar/') || id.includes('fullcalendar')) {
              return 'vendor-calendar';
            }
            
            // Recharts - charting library
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Socket.io - only needed for chat
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            
            // Radix UI components - group together
            if (id.includes('@radix-ui/')) {
              return 'vendor-radix';
            }
            
            // Other large libraries
            if (id.includes('react-hook-form') || id.includes('@hookform/')) {
              return 'vendor-forms';
            }
            
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            
            // All other node_modules
            return 'vendor-misc';
          }
        },
      },
    },
    // Enable minification and source maps
    minify: 'esbuild',
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})


