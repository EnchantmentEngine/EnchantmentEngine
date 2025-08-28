import { defineConfig } from 'vitest/config'

process.env.TEST = 'true'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    isolate: true,
    fileParallelism: false,
    hookTimeout: 15 * 60 * 1000,
    testTimeout: 15 * 60 * 1000,
    maxConcurrency: 1,
    coverage: {
      enabled: true,
      reporter: ['lcov'],
      provider: 'istanbul',
      include: ['src/**']
    }
  }
})
