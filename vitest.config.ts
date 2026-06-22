import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/domain/**', 'src/patterns/**'],
      exclude: ['src/renderer/**', 'src/main/**', 'src/database/**']
    }
  },
  resolve: {
    alias: {
      '@domain': resolve('src/domain'),
      '@database': resolve('src/database'),
      '@patterns': resolve('src/patterns')
    }
  }
})
