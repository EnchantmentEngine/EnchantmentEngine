import { spawnPointMethods, spawnPointPath } from '@ir-engine/common/src/schemas/world/spawn-point.schema'

import { Application } from '../../../declarations'
import { SpawnPointService } from './spawn-point.class'
import spawnPointDocs from './spawn-point.docs'
import hooks from './spawn-point.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [spawnPointPath]: SpawnPointService
  }
}

export default (app: Application): void => {
  const options = {
    name: spawnPointPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(spawnPointPath, new SpawnPointService(options), {
    // A list of all methods this service exposes externally
    methods: spawnPointMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: spawnPointDocs
  })

  const service = app.service(spawnPointPath)
  service.hooks(hooks)
}
