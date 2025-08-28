import { migrationsInfoMethods, migrationsInfoPath } from '@ir-engine/common/src/schemas/cluster/migrations-info.schema'

import { Application } from '../../../declarations'
import { MigrationsInfoService } from './migrations-info.class'
import migrationsInfoDocs from './migrations-info.docs'
import hooks from './migrations-info.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [migrationsInfoPath]: MigrationsInfoService
  }
}

export default (app: Application): void => {
  const options = {
    name: migrationsInfoPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(migrationsInfoPath, new MigrationsInfoService(options), {
    // A list of all methods this service exposes externally
    methods: migrationsInfoMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: migrationsInfoDocs
  })

  const service = app.service(migrationsInfoPath)
  service.hooks(hooks)
}
