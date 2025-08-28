import { userKickMethods, userKickPath } from '@ir-engine/common/src/schemas/user/user-kick.schema'

import { Application } from '../../../declarations'
import { UserKickService } from './user-kick.class'
import userKickDocs from './user-kick.docs'
import hooks from './user-kick.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userKickPath]: UserKickService
  }
}

export default (app: Application): void => {
  const options = {
    name: userKickPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userKickPath, new UserKickService(options), {
    // A list of all methods this service exposes externally
    methods: userKickMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userKickDocs
  })

  const service = app.service(userKickPath)
  service.hooks(hooks)
}
