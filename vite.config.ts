import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import os from 'os';

// Platform-specific optimizations
const isWindows = os.platform() === 'win32';
const isDevelopment = process.env.NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: process.env.HOST || (isWindows ? "localhost" : "::"),
    port: parseInt(process.env.PORT || "8080"),
    open: !process.env.CI, // Don't auto-open in CI environments
    strictPort: false, // Allow port changes if busy
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.36.234',
      '77b8142a6f5a.ngrok-free.app',
      '.ngrok-free.app',
      '.loca.lt'
    ],
    hmr: {
      overlay: isDevelopment,
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web"),
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
        // Enhanced chunk splitting for better caching and loading
        manualChunks: (id: string) => {
          // React ecosystem - separate for better caching
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          
          // Radix UI components - separate for better caching
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Lucide icons - separate for better caching
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }
          
          // Supabase client - separate for better caching
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Octokit for GitHub integration
          if (id.includes('@octokit')) {
            return 'octokit';
          }
          
          // Form handling libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'form-handling';
          }
          
          // Security and monitoring utilities
          if (id.includes('crypto') || id.includes('security') || id.includes('audit')) {
            return 'security-utils';
          }
          
          // Quantum computing services - split by domain for better caching
          if (id.includes('quantum') && id.includes('services')) {
            if (id.includes('quantum/aerospace')) {
              return 'quantum-aerospace';
            }
            if (id.includes('quantum/healthcare')) {
              return 'quantum-healthcare';
            }
            if (id.includes('quantum/financial')) {
              return 'quantum-financial';
            }
            if (id.includes('quantum/entertainment')) {
              return 'quantum-entertainment';
            }
            if (id.includes('quantum/energy')) {
              return 'quantum-energy';
            }
            if (id.includes('quantum/supplychain')) {
              return 'quantum-supplychain';
            }
            return 'quantum-core';
          }
          
          // Anomaly detection services
          if (id.includes('anomaly') && id.includes('services')) {
            return 'anomaly-services';
          }
          
          // AI/ML services
          if (id.includes('ai-ml') && id.includes('services')) {
            return 'ai-ml-services';
          }
          
          // Identity and authentication services
          if (id.includes('identity') && id.includes('services')) {
            return 'identity-services';
          }
          
          // CI/CD services
          if (id.includes('cicd') && id.includes('services')) {
            return 'cicd-services';
          }
          
          // Application security services
          if (id.includes('application') && id.includes('services')) {
            return 'app-security-services';
          }
          
          // Data services
          if (id.includes('data') && id.includes('services')) {
            return 'data-services';
          }
          
          // Network services
          if (id.includes('network') && id.includes('services')) {
            return 'network-services';
          }
          
          // Monitoring services
          if (id.includes('monitoring') && id.includes('services')) {
            return 'monitoring-services';
          }
          
          // Other large third-party libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Optimize file naming for caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: (chunkInfo: import('rollup').PreRenderedChunk) => {
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
    // Global fallbacks for missing environment variables
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  envPrefix: ['VITE_', 'SUPABASE_', 'SONARQUBE_', 'SNYK_', 'SLACK_'],
  
  // ESBuild configuration for better performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
  },
}));
