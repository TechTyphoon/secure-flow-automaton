import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/secure-flow-automaton/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    // Enable production optimizations
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    
    // PWA Optimization: Service Worker
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sw: path.resolve(__dirname, 'public/sw.js')
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries (largest dependencies)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-progress',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-popover',
            '@radix-ui/react-menubar',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-slot',
            'vaul',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'cmdk'
          ],
          
          // Icons (lucide-react is quite large)
          'icons': ['lucide-react'],
          
          // Chart library
          'charts': ['recharts'],
          
          // Data fetching and state management
          'data-vendor': [
            '@tanstack/react-query',
            '@supabase/supabase-js'
          ],
          
          // Utilities and smaller libraries
          'utils': [
            'date-fns',
            'react-day-picker',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ]
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Create meaningful names for route-based chunks
            if (facadeModuleId.includes('pages/')) {
              const pageName = facadeModuleId.split('pages/')[1].split('.')[0].toLowerCase()
              return `pages/${pageName}-[hash].js`
            }
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]'
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `styles/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    
    // Set chunk size warning limits
    chunkSizeWarningLimit: 1000,
    
    // Enable advanced minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Target modern browsers for better optimization
    target: 'esnext'
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react'
    ],
    exclude: ['@radix-ui/react-*']
  },
  
  // Enable experimental features for better performance
  esbuild: {
    // Remove console logs in production
    drop: ['console', 'debugger'],
  }
}));
