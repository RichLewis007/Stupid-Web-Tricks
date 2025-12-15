import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/pages/',
        'src/layouts/',
        '**/*.astro',
        '**/*.config.{js,ts}',
        '**/dist/**',
      ],
    },
  },
});
