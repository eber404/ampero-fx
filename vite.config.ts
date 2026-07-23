import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['minipc.lan'],
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**'],
  },
});
