import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'scripts/**/*.{test,spec}.ts',
      // Unit tests on Edge Function helpers — only files that don't
      // depend on the Deno runtime (no `Deno.env`, no URL imports).
      // The `__tests__/` convention keeps Deno's own runner happy too.
      'supabase/functions/**/__tests__/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
