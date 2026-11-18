import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests to /api are proxied to the Node server (port 5000),
// so the session cookie stays same-origin.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});