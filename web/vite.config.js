import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
  build: {
    // The tree-shaken AG Grid route chunk is 533 KB raw / about 149 KB gzip.
    // Keep a small allowance for that lazy-loaded grid instead of flagging it as an oversized app bundle.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/ag-grid-community/')) return 'ag-grid-community';
          if (id.includes('/node_modules/ag-grid-react/')) return 'ag-grid-react';
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react-vendor';
        },
      },
    },
  },
});

