import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import knex from 'knex'
import path from 'path'
import { promisify } from 'util'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@ir-engine/common/src/regex'
import { EngineSettingData, engineSettingPath } from '@ir-engine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const execAsync = promisify(exec)

cli.enable('status')

const options = cli.parse({
  stage: [true, 'dev, prod, etc; deployment stage', 'string']
})

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

    const helmSettings = await knexClient.select().from<EngineSettingData>(engineSettingPath).where({
      category: 'helm'
    })

    const helmBuilder = helmSettings.find((setting) => setting.key == EngineSettings.Helm.Main)?.value
    const helmMain = helmSettings.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value

    const helmMainVersionName = path.join(appRootPath.path, 'helm-main-version.txt')
    const helmBuilderVersionName = path.join(appRootPath.path, 'helm-builder-version.txt')

    if (helmSettings && helmSettings.length > 0) {
      if (helmMain) fs.writeFileSync(helmMainVersionName, helmMain)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)
        const matches = stdout.matchAll(MAIN_CHART_REGEX)
        for (const match of matches) {
          const mainChartVersion = match[1]
          if (mainChartVersion) {
            fs.writeFileSync(helmMainVersionName, mainChartVersion)
          }
        }
      }
      if (helmBuilder && helmBuilder.length > 0) fs.writeFileSync(helmBuilderVersionName, helmBuilder)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage}-builder | grep deployed`)
        const matches = stdout.matchAll(BUILDER_CHART_REGEX)
        for (const match of matches) {
          const builderChartVersion = match[1]
          if (builderChartVersion) {
            fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)

      const mainChartMatches = stdout.matchAll(MAIN_CHART_REGEX)
      for (const match of mainChartMatches) {
        const mainChartVersion = match[1]
        if (mainChartVersion) {
          fs.writeFileSync(helmMainVersionName, mainChartVersion)
        }
      }

      const builderChartMatches = stdout.matchAll(BUILDER_CHART_REGEX)
      for (const match of builderChartMatches) {
        const builderChartVersion = match[1]
        if (builderChartVersion) {
          fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
        }
      }
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
