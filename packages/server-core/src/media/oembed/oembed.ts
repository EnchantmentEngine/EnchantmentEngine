import { oembedMethods, oembedPath } from '@ir-engine/common/src/schemas/media/oembed.schema'

import { Application } from '../../../declarations'
import { OembedService } from './oembed.class'
import oembedDocs from './oembed.docs'
import hooks from './oembed.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [oembedPath]: OembedService
  }
}

export default (app: Application): void => {
  app.use(oembedPath, new OembedService(app), {
    // A list of all methods this service exposes externally
    methods: oembedMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: oembedDocs
  })

  const service = app.service(oembedPath)
  service.hooks(hooks)
}
