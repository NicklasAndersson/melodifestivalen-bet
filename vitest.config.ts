/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: [/@radix-ui/, /class-variance-authority/],
      },
    },
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts'],
    },
  },
});
