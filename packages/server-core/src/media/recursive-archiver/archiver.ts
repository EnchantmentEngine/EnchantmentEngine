import { archiverMethods, archiverPath } from '@ir-engine/common/src/schemas/media/archiver.schema'

import { Application } from '../../../declarations'
import { ArchiverService } from './archiver.class'
import archiverDocs from './archiver.docs'
import hooks from './archiver.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [archiverPath]: ArchiverService
  }
}

export default (app: Application): void => {
  app.use(archiverPath, new ArchiverService(app), {
    // A list of all methods this service exposes externally
    methods: archiverMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: archiverDocs
  })

  const service = app.service(archiverPath)
  service.hooks(hooks)
}
