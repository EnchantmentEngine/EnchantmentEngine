import { pipe } from '@ir-engine/common/src/utils/pipe'
import { Application } from '@ir-engine/server-core/declarations'
import config from '@ir-engine/server-core/src/appconfig'
import {
  configureK8s,
  configurePrimus,
  configureRedis,
  createFeathersKoaApp
} from '@ir-engine/server-core/src/createApp'
import multiLogger from '@ir-engine/server-core/src/ServerLogger'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'

import collectEvents from './collect-events'

const logger = multiLogger.child({ component: 'taskserver' })

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

const taskServerPipe = pipe(configurePrimus(), configureRedis(), configureK8s())

export const start = async (): Promise<Application> => {
  const app = await createFeathersKoaApp(ServerMode.Task, taskServerPipe)

  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  collectEvents(app)
  logger.info('Task server running.')

  const port = Number(config['task-server'].port) || 5050

  await app.listen(port)

  logger.info('Started listening on ' + port)

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })

  return app
}
