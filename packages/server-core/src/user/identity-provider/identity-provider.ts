import {
  identityProviderMethods,
  identityProviderPath
} from '@ir-engine/common/src/schemas/user/identity-provider.schema'

import { Application } from '../../../declarations'
import { IdentityProviderService } from './identity-provider.class'
import identityProviderDocs from './identity-provider.docs'
import hooks from './identity-provider.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [identityProviderPath]: IdentityProviderService
  }
}

export default (app: Application): void => {
  const options = {
    name: identityProviderPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(identityProviderPath, new IdentityProviderService(options), {
    // A list of all methods this service exposes externally
    methods: identityProviderMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: identityProviderDocs
  })

  const service = app.service(identityProviderPath)
  service.hooks(hooks)
}
