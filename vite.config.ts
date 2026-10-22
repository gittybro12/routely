import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const backendTarget = loadEnv(mode, '.', 'ROUTELY_').ROUTELY_API_TARGET || 'http://127.0.0.1:8000';
  return {
    plugins: [react()],
    server: {
      watch: { ignored: ['**/backend/**'] },
      fs: { deny: ['**/backend/**', '**/.env*', '**/*.{crt,pem}', '**/.git/**'] },
      proxy: {
        '/api/v1': { target: backendTarget, changeOrigin: true },
        '/admin': { target: backendTarget, changeOrigin: true },
        '/static': { target: backendTarget, changeOrigin: true },
        '/api': { target: 'http://127.0.0.1:11434', changeOrigin: true },
      },
    },
  };
});
