import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Development config that points to source for hot reloading
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'minot': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3000,
  },
});
