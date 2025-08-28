// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { apiJobPath, githubRepoAccessRefreshPath, userPath } from '@ir-engine/common/src/schema.type.module'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { updateAppConfig } from '@ir-engine/server-core/src/updateAppConfig'

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
  jobId: [false, 'ID of Job record', 'string']
})

cli.main(async () => {
  try {
    await updateAppConfig()
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const { userId, jobId } = options
    const user = await app.service(userPath).get(userId)
    await app.service(githubRepoAccessRefreshPath).find(Object.assign({}, {}, { user }))
    const date = await getDateTimeSql()
    await app.service(apiJobPath).patch(jobId, {
      status: 'succeeded',
      endTime: date
    })
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
