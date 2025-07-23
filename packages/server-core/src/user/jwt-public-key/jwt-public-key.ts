// Initializes the `login` service on path `/login`

import { jwtPublicKeyMethods, jwtPublicKeyPath } from '@ir-engine/common/src/schemas/user/jwt-public-key.schema'
import { Application } from '../../../declarations'
import { JWTPublicKeyService } from './jwt-public-key.class'
import jwtPublicKeyDocs from './jwt-public-key.docs'
import hooks from './jwt-public-key.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [jwtPublicKeyPath]: JWTPublicKeyService
  }
}

export default (app: Application): void => {
  app.use(jwtPublicKeyPath, new JWTPublicKeyService(app), {
    // A list of all methods this service exposes externally
    methods: jwtPublicKeyMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: jwtPublicKeyDocs
  })

  const service = app.service(jwtPublicKeyPath)
  service.hooks(hooks)
}
