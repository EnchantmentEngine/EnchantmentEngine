import { userSettingMethods, userSettingPath } from '@ir-engine/common/src/schemas/user/user-setting.schema'

import { Application } from '../../../declarations'
import { UserSettingService } from './user-setting.class'
import userSettingDocs from './user-setting.docs'
import hooks from './user-setting.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userSettingPath]: UserSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: userSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userSettingPath, new UserSettingService(options), {
    // A list of all methods this service exposes externally
    methods: userSettingMethods,
    // You can add additional custom events to be sent to client here
    events: [],
    docs: userSettingDocs
  })

  const service = app.service(userSettingPath)
  service.hooks(hooks)
}
