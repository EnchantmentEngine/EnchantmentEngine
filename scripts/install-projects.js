

// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import { projectPath } from '@ir-engine/common/src/schema.type.module'
import logger from '@ir-engine/server-core/src/ServerLogger'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { createDefaultStorageProvider } from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import { download } from '@ir-engine/server-core/src/projects/project/downloadProjects'
import { getProjectConfig, onProjectEvent } from '@ir-engine/server-core/src/projects/project/project-helper'
import appRootPath from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'ir-engine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql'
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

async function installAllProjects() {
  try {
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    createDefaultStorageProvider()
    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects')
    if (!fs.existsSync(localProjectDirectory)) fs.mkdirSync(localProjectDirectory, { recursive: true })
    logger.info('running installAllProjects')

    const projects = await app.service(projectPath).find({ paginate: false, query: { assetsOnly: false } })
    logger.info('found projects %o', projects)
    await Promise.all(projects.map((project) => download(project.name)))
    const updatedProject = await app
      .service(projectPath)
      .update('', { sourceURL: 'enchantmentengine/default-project' }, { isInternal: true, isJob: true })
    const projectConfig = await getProjectConfig('enchantmentengine/default-project')
    if (projectConfig && projectConfig.onEvent)
      await onProjectEvent(app, updatedProject, projectConfig.onEvent, 'onUpdate')
    process.exit(0)
  } catch (e) {
    logger.fatal(e)
    console.error(e)
    process.exit(1)
  }
}

installAllProjects()
