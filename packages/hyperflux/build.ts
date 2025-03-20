import { exec } from 'child_process'
import fs from 'fs'
import { join } from 'path'

const build = async () => {
  // clear dist if it exists
  if (fs.existsSync('dist')) fs.rmdirSync('dist', { recursive: true })

  // run tsc --build tsconfig.build.json
  await new Promise((resolve, reject) => {
    exec('tsc --build tsconfig.build.json', (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })

  // remove tsconfig.build.tsbuildinfo
  if (fs.existsSync('dist/tsconfig.build.tsbuildinfo')) {
    fs.unlinkSync('dist/tsconfig.build.tsbuildinfo')
  }

  // copy LICENSE, readme.md, and package.build.json to dist
  fs.copyFileSync('LICENSE', join('dist', 'LICENSE'))
  fs.copyFileSync('readme.md', join('dist', 'readme.md'))
  fs.copyFileSync('package.build.json', join('dist', 'package.json'))
}
build()
