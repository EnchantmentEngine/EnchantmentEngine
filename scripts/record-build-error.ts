import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import knex from 'knex'

import { generateInstallationOctokit } from '@ir-engine/server-core/src/projects/project/github-helper'

import { buildStatusPath, BuildStatusType } from '@ir-engine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const options = cli.parse({
  service: [false, 'Name of failing service', 'string'],
  isDocker: [false, 'Whether or not this is checking logs files for a Docker process.', 'boolean']
})

interface Payload {
  release: string
  service: string
  logs: string
}

async function callGithubDispatch(payload: Payload) {
  const installationOctokit = generateInstallationOctokit(
    process.env.GITHUB_RECORD_ERROR_APP_ID,
    process.env.GITHUB_RECORD_ERROR_APP_PRIVATE_KEY,
    process.env.GITHUB_RECORD_ERROR_INSTALLATION_ID
  )

  await installationOctokit.request({
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json'
    },
    url: `/repos/{owner}/{repo}/dispatches`,
    owner: process.env.GITHUB_RECORD_ERROR_OWNER,
    repo: process.env.GITHUB_RECORD_ERROR_REPO,
    event_type: process.env.GITHUB_RECORD_ERROR_DISPATCH_NAME,
    client_payload: payload
  })
}

cli.main(async () => {
  try {
    const knexClient = knex({
      client: 'mysql2',
      connection: {
        user: process.env.MYSQL_USER ?? 'server',
        password: process.env.MYSQL_PASSWORD ?? 'password',
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DATABASE ?? 'ir-engine',
        charset: 'utf8mb4'
      }
    })

    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const buildLogs = fs.readFileSync(`${options.service}-build-logs.txt`).toString()
    const buildErrors = fs.readFileSync(`${options.service}-build-error.txt`).toString()
    const builderRun = fs.existsSync('builder-run.txt') ? fs.readFileSync('builder-run.txt').toString() : '0'
    if (options.isDocker) {
      console.log('isDocker is true')
      const cacheMissRegex = new RegExp(`${options.service}:latest_${process.env.RELEASE_NAME}_cache: not found`)
      console.log('exit code 1', /exit code: 1/.test(buildErrors))
      console.log('Non cache miss ERROR', /ERROR:/.test(buildErrors) && !cacheMissRegex.test(buildErrors))
      if (/exit code: 1/.test(buildErrors) || (/ERROR:/.test(buildErrors) && !cacheMissRegex.test(buildErrors))) {
        console.log('Recording error')
        const combinedLogs = `Docker task that errored: ${options.service}\n\nTask logs:\n\n${buildErrors}`
        await knexClient
          .from<BuildStatusType>(buildStatusPath)
          .where({
            id: parseInt(builderRun)
          })
          .update({
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          })

        if (
          process.env.GITHUB_RECORD_ERROR_OWNER &&
          process.env.GITHUB_RECORD_ERROR_REPO &&
          process.env.GITHUB_RECORD_ERROR_WORKFLOW
        )
          await callGithubDispatch({
            release: process.env.RELEASE_NAME,
            service: options.service,
            logs: combinedLogs.replaceAll('"', "'").replaceAll('`', "'")
          })

        console.log('exiting with code 1')
        cli.exit(1)
      } else cli.exit(0)
    } else {
      if ((/error/i.test(buildErrors) && !/'errors'/i.test(buildErrors)) || /fail/i.test(buildErrors)) {
        const combinedLogs = `Task that errored: ${options.service}\n\nError logs:\n\n${buildErrors}\n\nTask logs:\n\n${buildLogs}`
        await knexClient
          .from<BuildStatusType>(buildStatusPath)
          .where({
            id: parseInt(builderRun)
          })
          .update({
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          })

        if (
          process.env.GITHUB_RECORD_ERROR_OWNER &&
          process.env.GITHUB_RECORD_ERROR_REPO &&
          process.env.GITHUB_RECORD_ERROR_WORKFLOW
        )
          await callGithubDispatch({
            release: process.env.RELEASE_NAME,
            service: options.service,
            logs: combinedLogs.replaceAll('"', "'").replaceAll('`', "'")
          })

        cli.exit(1)
      } else cli.exit(0)
    }
  } catch (err) {
    console.log(err)

    if (
      process.env.GITHUB_RECORD_ERROR_OWNER &&
      process.env.GITHUB_RECORD_ERROR_REPO &&
      process.env.GITHUB_RECORD_ERROR_WORKFLOW
    )
      await callGithubDispatch({
        release: process.env.RELEASE_NAME,
        service: options.service,
        logs: err.toString().replaceAll('"', "'").replaceAll('`', "'")
      })

    cli.fatal(err)
  }
})
