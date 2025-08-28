// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { projectPath, userPath } from '@ir-engine/common/src/schema.type.module'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { pushProjectToGithub } from '@ir-engine/server-core/src/projects/project/github-helper'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'

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
  projectId: [false, 'ID of project to push', 'string'],
  userId: [false, 'ID of user updating project', 'string'],
  reset: [false, 'Whether to force reset the project', 'string'],
  commitSHA: [false, 'Commit SHA to use for project', 'string'],
  storageProviderName: [false, 'Storage provider name', 'string'],
  jobId: [false, 'ID of Job record', 'string']
})

cli.main(async () => {
  try {
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const { userId, projectId, reset, commitSHA, storageProviderName, jobId } = options
    const user = await app.service(userPath).get(userId)
    const project = await app.service(projectPath).get(projectId)
    await pushProjectToGithub(app, project, user, reset, commitSHA, storageProviderName || undefined, true, jobId)
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
