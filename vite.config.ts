import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import os from 'os';

// Platform-specific optimizations
const isWindows = os.platform() === 'win32';
const isDevelopment = process.env.NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/secure-flow-automaton/' : '/',
  server: {
    host: process.env.HOST || (isWindows ? "localhost" : "::"),
    port: parseInt(process.env.PORT || "8080"),
    open: !process.env.CI, // Don't auto-open in CI environments
    strictPort: false, // Allow port changes if busy
    cors: true,
    hmr: {
      overlay: isDevelopment,
    },
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
    // Cross-platform build optimizations
    outDir: 'dist',
    assetsDir: 'assets',
    minify: mode === 'production' ? 'esbuild' : false,
    cssMinify: mode === 'production',
    sourcemap: mode === 'development' || process.env.GENERATE_SOURCEMAP === 'true',
    target: ['esnext', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
    // Optimize for different platforms
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Platform-optimized chunking
        manualChunks: (id: string) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // UI libraries
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          
          // Security and monitoring utilities
          if (id.includes('crypto') || id.includes('security') || id.includes('audit')) {
            return 'security-vendor';
          }
          
          // Large third-party libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Optimize file naming for caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: (chunkInfo: any) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${facadeModuleId}.[hash].js`;
        },
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    
    // Memory and performance optimizations
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Faster builds
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@supabase/supabase-js',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Cross-platform environment handling
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __PLATFORM__: JSON.stringify(os.platform()),
  },
  
  // ESBuild configuration for better performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
  },
}));
