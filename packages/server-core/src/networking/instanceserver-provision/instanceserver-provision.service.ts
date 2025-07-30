import { Application } from '../../../declarations'
import { patchInstanceserverLocation } from './instanceserver-provision-helper'
import hooks from './instanceserver-provision.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    'instanceserver-provision': {
      patch: ReturnType<typeof patchInstanceserverLocation>
    }
  }
}

export default (app: Application): void => {
  app.use('instanceserver-provision', {
    patch: patchInstanceserverLocation(app)
  })

  const service = app.service('instanceserver-provision')

  service.hooks(hooks)
}
