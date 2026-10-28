import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // ARENA_TOKEN from .env.local. Only this server sees it; the browser calls /arena/... and the
  // proxy adds the token. On Vercel, api/arena.js does the same job.
  const { ARENA_TOKEN } = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/arena': {
      target: 'https://api.are.na',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/arena/, ''),
      headers: ARENA_TOKEN ? { Authorization: `Bearer ${ARENA_TOKEN}` } : {},
    },
  };
  return { plugins: [react()], server: { proxy }, preview: { proxy } };
});
