import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  server: {
    port: 5173,
    host: true, // Needed for docker mapping
    watch: {
      usePolling: true, // Helps with hot-reload inside virtualised filesystems
    },
  },
});
