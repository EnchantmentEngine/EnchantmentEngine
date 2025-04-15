import { execSync } from 'child_process'
import fs from 'fs'
import path from 'node:path'

const isGithubAction = process.env.GITHUB_ACTIONS === 'true'

function log(...args: any[]) {
  if (!isGithubAction) {
    console.log(...args)
  }
}

try {
  log('Comparing with origin/dev...\n')

  // Get list of modified or added files
  const cwd = path.resolve(__dirname, '../../..')
  const output = execSync('git diff --name-status origin/dev...HEAD', { cwd }).toString().trim()

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

    if ((status === 'M' || status === 'A') && filename.endsWith('.tsx') && !filename.includes('.stories')) {
      tsxFiles.push(file)
    }
  })

  log('Relevant .tsx files:', tsxFiles)

  const hasStories = tsxFiles.some((file) => {
    const dirname = path.dirname(file)
    const basename = path.basename(file, '.tsx')
    const storiesPath = path.join(cwd, dirname, `${basename}.stories.tsx`)
    return fs.existsSync(storiesPath)
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
