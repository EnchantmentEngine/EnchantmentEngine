import { userApiKeyMethods, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'

import { Application } from '../../../declarations'
import { UserApiKeyService } from './user-api-key.class'
import userApiKeyDocs from './user-api-key.docs'
import hooks from './user-api-key.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userApiKeyPath]: UserApiKeyService
  }
}

export default (app: Application): void => {
  const options = {
    name: userApiKeyPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userApiKeyPath, new UserApiKeyService(options), {
    // A list of all methods this service exposes externally
    methods: userApiKeyMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userApiKeyDocs
  })

  const service = app.service(userApiKeyPath)
  service.hooks(hooks)
}
