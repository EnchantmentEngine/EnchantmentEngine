import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { defineWorkspace } from 'vitest/config'
dotenv.config({ path: '.env.local' })
export default defineWorkspace([
  // If you want to keep running your existing tests in Node.js, uncomment the next line.
  // 'vite.config.ts',
  {
    plugins: [react()],
    test: {
      include: ['packages/vitest-example/*.test.tsx'],
      env: process.env,
      globalSetup: ['packages/vitest-example/global.setup.ts'],
      browser: {
        enabled: true,
        provider: 'playwright',
        // https://vitest.dev/guide/browser/playwright,
        instances: [{ browser: 'chromium' }],
        // headless: true,
        testerHtmlPath: 'packages/vitest-example/index.html',
        orchestratorScripts: [{ src: 'packages/vitest-example/orchestrator.js' }]
      }
    }
  }
])
