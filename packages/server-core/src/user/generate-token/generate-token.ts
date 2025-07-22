import { generateTokenMethods, generateTokenPath } from '@ir-engine/common/src/schemas/user/generate-token.schema'

import { Application } from '../../../declarations'
import { GenerateTokenService } from './generate-token.class'
import generateTokenDocs from './generate-token.docs'
import hooks from './generate-token.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [generateTokenPath]: GenerateTokenService
  }
}

export default (app: Application): void => {
  app.use(generateTokenPath, new GenerateTokenService(app), {
    // A list of all methods this service exposes externally
    methods: generateTokenMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: generateTokenDocs
  })

  const service = app.service(generateTokenPath)
  service.hooks(hooks)
}
