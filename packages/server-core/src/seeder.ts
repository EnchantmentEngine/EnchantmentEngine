import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject } from './projects/project/project-helper'
import { knexSeeds } from './seeder-config'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:seeder' })

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (forceRefresh || prepareDb) {
    logger.info('Seeding or preparing database')

    const seeds = await knexSeeds()
    const knexClient = app.get('knexClient')
    for (const seedFile of seeds) {
      logger.info('Seeding', seedFile)
      await seedFile.seed(knexClient)
      logger.info('Finished seeding', seedFile)
    }
  }

  if (prepareDb) return

  if (forceRefresh) {
    logger.info('Refreshing default project')
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled && !config.testEnabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    if (config.kubernetes.enabled || config.testEnabled)
      await app.service(projectPath)._seedProject('ir-engine/default-project')
  }

  if (!config.kubernetes.enabled && !config.testEnabled) await app.service(projectPath)._syncDevLocalProjects()
}
