import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/utils/__tests__/**/*.spec.ts'],
  },
})
