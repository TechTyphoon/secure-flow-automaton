import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import os from 'os';

// Cross-platform path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Platform-specific optimizations
const isWindows = os.platform() === 'win32';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/secure-flow-automaton/' : '/',
  server: {
    host: process.env.HOST || (isWindows ? "localhost" : "::"),
    port: parseInt(process.env.PORT || "8080"),
    open: !process.env.CI,
    strictPort: false,
    cors: true,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./"),
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: mode === 'production' ? 'esbuild' : false,
    cssMinify: mode === 'production',
    sourcemap: mode === 'development' || process.env.GENERATE_SOURCEMAP === 'true',
    target: ['esnext', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...(process.env.BUILD_PWA === 'true' && {
          sw: path.resolve(__dirname, 'public/sw.js')
        })
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
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
          'icons': ['lucide-react'],
          'charts': ['recharts'],
          'data-vendor': [
            '@tanstack/react-query',
            '@supabase/supabase-js'
          ],
          'utils': [
            'date-fns',
            'react-day-picker',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ]
        },

        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            if (facadeModuleId.includes('pages/')) {
              const pageName = facadeModuleId.split('pages/')[1].split('.')[0].toLowerCase();
              return `pages/${pageName}-[hash].js`;
            }
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js';
            }
          }
          return 'chunks/[name]-[hash].js';
        },

        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },

    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },

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

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __PLATFORM__: JSON.stringify(os.platform()),
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
  }
}));
