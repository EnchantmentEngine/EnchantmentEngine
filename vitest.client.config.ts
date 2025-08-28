import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config'

const reporters = !process.env.CI ? ['basic'] : configDefaults.reporters // Use default report config on CI.

import appRootPath from 'app-root-path'
import path from 'path'

export default defineConfig({
  test: {
    setupFiles: [
      path.resolve(appRootPath.path, 'packages/hyperflux/tests/utils/patchNode.ts'),
      path.resolve(appRootPath.path, './vitest.setup.ts')
    ],
    environment: 'jsdom',
    maxConcurrency: 1,
    passWithNoTests: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: reporters,
    slowTestThreshold: 1000,
    coverage: {
      enabled: true,
      reporter: ['lcov'],
      provider: 'istanbul',
      include: ['src/**'],
      exclude: ['src/xr/WebXRManager.*', ...coverageConfigDefaults.exclude] //WebXrManager completely breaks with coverage enabled
    }
  }
})
