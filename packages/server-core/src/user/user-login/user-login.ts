import { userLoginMethods, userLoginPath } from '@ir-engine/common/src/schemas/user/user-login.schema'
import { Application } from '../../../declarations'
import { UserLoginService } from './user-login.class'
import userLoginDocs from './user-login.docs'
import hooks from './user-login.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userLoginPath]: UserLoginService
  }
}

export default (app: Application): void => {
  const options = {
    name: userLoginPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userLoginPath, new UserLoginService(options), {
    // A list of all methods this service exposes externally
    methods: userLoginMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userLoginDocs
  })

  const service = app.service(userLoginPath)
  service.hooks(hooks)
}
