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
    exclude: ['@tanstack/router-devtools', 'googleapis', 'google-auth-library','posthog-js'],
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    rollupOptions: {
      output: {
        // Smart chunking: Keep React ecosystem together, split only independent large libs
        // Route-level code splitting (React.lazy) will handle the rest
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split only large independent libraries that don't depend on React
            if (id.includes('@fullcalendar/') || id.includes('fullcalendar')) {
              return 'vendor-calendar';
            }
            
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            
            // Everything else (including React and all React-dependent libs) stays together
            // This prevents React initialization errors while route-level splitting reduces bundle size
            // The route-level lazy loading we added will create separate chunks for each route
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



