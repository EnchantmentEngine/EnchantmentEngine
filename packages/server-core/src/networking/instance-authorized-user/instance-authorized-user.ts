import {
  instanceAuthorizedUserMethods,
  instanceAuthorizedUserPath
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

import { Application } from '../../../declarations'
import { InstanceAuthorizedUserService } from './instance-authorized-user.class'
import instanceAuthorizedUserDocs from './instance-authorized-user.docs'
import hooks from './instance-authorized-user.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceAuthorizedUserPath]: InstanceAuthorizedUserService
  }
}

export default (app: Application): void => {
  const options = {
    name: instanceAuthorizedUserPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(instanceAuthorizedUserPath, new InstanceAuthorizedUserService(options), {
    // A list of all methods this service exposes externally
    methods: instanceAuthorizedUserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceAuthorizedUserDocs
  })

  const service = app.service(instanceAuthorizedUserPath)
  service.hooks(hooks)
}
