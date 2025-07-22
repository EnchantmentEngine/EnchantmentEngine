import { invalidationMethods, invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'

import { Application } from '../../../declarations'
import { InvalidationService } from './invalidation.class'
import invalidationDocs from './invalidation.docs'
import hooks from './invalidation.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [invalidationPath]: InvalidationService
  }
}

export default (app: Application): void => {
  const options = {
    name: invalidationPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(invalidationPath, new InvalidationService(options), {
    // A list of all methods this service exposes externally
    methods: invalidationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: invalidationDocs
  })

  const service = app.service(invalidationPath)
  service.hooks(hooks)
}
