import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from "vite-bundle-analyzer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
    ...(process.env.ANALYZE ? [analyzer({ analyzerMode: 'static' })] : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-toast'],
          icons: ['lucide-react'],
          animations: ['framer-motion'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, 'node_modules/react'),
      "react-dom": path.resolve(__dirname, 'node_modules/react-dom'),
      "react/jsx-runtime": path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      "react/jsx-dev-runtime": path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime"
    ],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    force: true,
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime"
    ],
  }
}));
