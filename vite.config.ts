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
      external: ['solid-js', 'solid-js/web', 'googleapis', 'google-auth-library']
    }
  }
})


