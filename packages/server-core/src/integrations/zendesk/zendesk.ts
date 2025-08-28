import { zendeskMethods, zendeskPath } from '@ir-engine/common/src/schemas/integrations/zendesk/zendesk.schema'

import { Application } from '../../../declarations'
import { ZendeskAuthenticationService } from './zendesk.class'
import zendeskAuthenticationDocs from './zendesk.docs'
import hooks from './zendesk.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [zendeskPath]: ZendeskAuthenticationService
  }
}

export default (app: Application): void => {
  app.use(zendeskPath, new ZendeskAuthenticationService(), {
    // A list of all methods this service exposes externally
    methods: zendeskMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: zendeskAuthenticationDocs
  })

  const service = app.service(zendeskPath)
  service.hooks(hooks)
}
