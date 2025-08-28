// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { NotAuthenticated } from '@feathersjs/errors'
import { projectPath, userPath } from '@ir-engine/common/src/schema.type.module'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'
import config from '@ir-engine/server-core/src/appconfig'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { updateAppConfig } from '@ir-engine/server-core/src/updateAppConfig'
import { retry } from '@octokit/plugin-retry'
import { Octokit } from '@octokit/rest'
import { JwtPayload, verify } from 'jsonwebtoken'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'ir-engine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  userId: [false, 'ID of user updating project', 'string'],
  sourceURL: [false, 'Source URL of project to update', 'string'],
  destinationURL: [false, 'Destination URL of project to update', 'string'],
  name: [false, 'Name of project', 'string'],
  needsRebuild: [false, 'Whether the project needs to be rebuilt', 'string'],
  reset: [false, 'Whether to force reset the project', 'string'],
  commitSHA: [false, 'Commit SHA to use for project', 'string'],
  sourceBranch: [false, 'Branch to use for project source', 'string'],
  updateType: [false, 'Type of updating for project', 'string'],
  updateSchedule: [false, 'Schedule for auto-updating project', 'string'],
  jobId: [false, 'ID of Job record', 'string'],
  token: [false, 'GitHub JWT', 'string'],
  isDependency: [false, 'Whether this is a dependency update', 'string']
})

cli.main(async () => {
  try {
    await updateAppConfig()
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const { userId, jobId, ...data } = options
    data.reset = data.reset === 'true'
    data.needsRebuild = data.needsRebuild === 'true'
    const params = {
      isJob: true,
      jobId,
      appJWT: data.token,
      signedByAppJWT: true,
      isDependency: data.isDependency === 'true'
    } as any
    if (data.token) {
      const appId = config.authentication.oauth.github.appId ? parseInt(config.authentication.oauth.github.appId) : null
      const token = data.token
      if (!config.authentication.oauth.github.privateKey) throw new NotAuthenticated('No GitHub private key configured')
      const jwtDecoded = verify(token, config.authentication.oauth.github.privateKey, {
        algorithms: ['RS256']
      })! as JwtPayload
      if (jwtDecoded.iss == null || parseInt(jwtDecoded.iss) !== appId)
        throw new NotAuthenticated('Invalid app credentials')
      const retryOctokit = Octokit.plugin(retry)
      const octoKit = new retryOctokit({ auth: token, retry: { enabled: process.env.TEST !== 'true' } })
      let appResponse
      try {
        appResponse = await octoKit.rest.apps.getAuthenticated()
      } catch (err) {
        throw new NotAuthenticated('Invalid app credentials')
      }
      if (appResponse.data.id !== appId) throw new NotAuthenticated('App ID of JWT does not match installed App ID')
      params.appJWT = data.token
      params.signedByAppJWT = true
    } else params.user = await app.service(userPath).get(userId)
    await app.service(projectPath).update('', data, params)
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
