import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/patients': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/api/beds': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/resources': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/analytics': {
        target: 'http://localhost:8083',
        changeOrigin: true
      },
      '/actuator-patient': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/actuator-patient/, '')
      },
      '/actuator-bed': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/actuator-bed/, '')
      },
      '/actuator-forecast': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/actuator-forecast/, '')
      }
    }
  }
});
