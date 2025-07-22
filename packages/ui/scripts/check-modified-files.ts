import { execSync } from 'child_process'
import fs from 'fs'
import path from 'node:path'

const isGithubAction = process.env.GITHUB_ACTIONS === 'true'

const whiteList = ['packages/ui/src/components', 'packages/client-core/src/components']

function log(...args: any[]) {
  if (!isGithubAction) {
    console.log(...args)
  }
}

try {
  log('Checking latest commit...\n')

  // Get list of modified or added files in the latest commit
  const cwd = path.resolve(__dirname, '../../..')
  const output = execSync('git diff --name-status HEAD~1 HEAD', { cwd }).toString().trim()

  if (!output) {
    log('No changes detected.')
    process.exit(1) // No changes, exit with failure
  }

  const lines = output.split('\n')
  const tsxFiles: string[] = []

  lines.forEach((line) => {
    const [status, ...fileParts] = line.split(/\s+/)
    const file = fileParts.join(' ')
    const filename = path.basename(file)

    if ((status === 'M' || status === 'A') && filename.endsWith('.tsx')) {
      if (whiteList.some((path) => file.startsWith(path))) {
        tsxFiles.push(file)
      }
    }
  })

  log('Relevant .tsx files:', tsxFiles)

  const hasStories = tsxFiles.some((file) => {
    if (file.endsWith('.stories.tsx')) return true

    const dirname = path.dirname(file)
    const basename = path.basename(file, '.tsx')
    return fs.existsSync(path.resolve(dirname, basename + '.stories.tsx'))
  })

  if (!hasStories) {
    log('❌ No corresponding .stories.tsx files found. Exiting early.')
    process.exit(1)
  } else {
    log('✅ Found at least one corresponding .stories.tsx file.')
    process.exit(0)
  }
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
