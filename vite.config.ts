import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) return 'vendor-react';
          if (id.includes('node_modules/@radix-ui/')) return 'vendor-ui';
          if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-query';
          if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) return 'vendor-map';
          if (id.includes('node_modules/recharts/')) return 'vendor-charts';
          if (id.includes('node_modules/framer-motion/')) return 'vendor-motion';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
}));
