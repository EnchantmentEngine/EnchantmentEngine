import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv-flow'
import knex from 'knex'

import { buildStatusPath, BuildStatusType } from '@ir-engine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

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

    await knexClient
      .from<BuildStatusType>(buildStatusPath)
      .where({
        status: 'pending'
      })
      .update({
        status: 'ended',
        dateEnded: dateNow
      })

    const newBuildStatus = await knexClient.from<BuildStatusType>(buildStatusPath).insert({
      dateStarted: dateNow,
      commitSHA: process.env.TAG ? process.env.TAG.split('_')[1] : '',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })

    const path = appRootPath.path + `/builder-run.txt`
    fs.writeFileSync(path, newBuildStatus.toString())

    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
