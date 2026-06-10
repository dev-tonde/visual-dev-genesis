import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { analyzer } from 'vite-bundle-analyzer';

const manualChunkGroups = {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-toast',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
  ],
  icons: ['lucide-react'],
  animations: ['framer-motion'],
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
  supabase: ['@supabase/supabase-js'],
} as const;

function getManualChunk(id: string) {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  for (const [chunkName, packages] of Object.entries(manualChunkGroups)) {
    if (
      packages.some(
        (pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`)
      )
    ) {
      return chunkName;
    }
  }

  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react(), ...(process.env.ANALYZE ? [analyzer({ analyzerMode: 'static' })] : [])],
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'framer-motion'],
  },
}));
