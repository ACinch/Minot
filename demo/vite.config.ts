import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config for testing the packaged npm module
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
