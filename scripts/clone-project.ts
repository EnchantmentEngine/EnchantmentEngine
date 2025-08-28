import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'

import { execPromise } from '@ir-engine/server-core/src/util/execPromise'
dotenv.config({
  path: appRootPath.path,
  silent: true
})
cli.enable('status')

/**
 * Repo must be in the format https://github.com/<ORG>/<REPO>
 */

const options = cli.parse({
  url: [false, 'Repo URL', 'string'],
  branch: ['b', 'Branch', 'string', 'dev']
}) as {
  url?: string
  branch: string
}

const cloneRepo = async () => {
  const branch = options.branch
  const url = options.url
  if (!url) throw new Error('URL is required')

  const [org, repo] = new URL(url).pathname.toLowerCase().split('/').slice(1, 3)

  const orgFolderPath = path.resolve(appRootPath.path, 'packages/projects/projects', org)
  const orgExists = await fs.promises
    .access(orgFolderPath)
    .then(() => true)
    .catch(() => false)

  if (!orgExists) {
    await fs.promises.mkdir(orgFolderPath)
  }

  const repoExists = await fs.promises
    .access(path.resolve(orgFolderPath, repo))
    .then(() => true)
    .catch(() => false)
  if (!repoExists) {
    await execPromise(`git clone ${url}`, {
      cwd: path.resolve(orgFolderPath)
    })
  }

  /** Checkout branch and rebase */
  /** @todo - this breaks with git-lfs */
  // await execPromise(`git checkout ${branch} && git fetch -p && git rebase`, {
  //   cwd: path.resolve(appRootPath.path, `packages/projects/projects/${org}/${repo}`)
  // })
}
cli.main(async () => {
  try {
    await cloneRepo()
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
