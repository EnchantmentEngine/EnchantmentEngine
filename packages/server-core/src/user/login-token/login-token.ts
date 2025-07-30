import { loginTokenMethods, loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'

import { Application } from '../../../declarations'
import { LoginTokenService } from './login-token.class'
import loginTokenDocs from './login-token.docs'
import hooks from './login-token.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [loginTokenPath]: LoginTokenService
  }
}

export default (app: Application): void => {
  const options = {
    name: loginTokenPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(loginTokenPath, new LoginTokenService(options), {
    // A list of all methods this service exposes externally
    methods: loginTokenMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: loginTokenDocs
  })

  const service = app.service(loginTokenPath)
  service.hooks(hooks)
}
