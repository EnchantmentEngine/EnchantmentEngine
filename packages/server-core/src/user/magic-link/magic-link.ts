import { magicLinkMethods, magicLinkPath } from '@ir-engine/common/src/schemas/user/magic-link.schema'

import { Application } from '../../../declarations'
import { MagicLinkService } from './magic-link.class'
import magicLinkDocs from './magic-link.docs'
import hooks from './magic-link.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [magicLinkPath]: MagicLinkService
  }
}

export default (app: Application): void => {
  app.use(magicLinkPath, new MagicLinkService(app), {
    // A list of all methods this service exposes externally
    methods: magicLinkMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: magicLinkDocs
  })

  const service = app.service(magicLinkPath)
  service.hooks(hooks)
}
