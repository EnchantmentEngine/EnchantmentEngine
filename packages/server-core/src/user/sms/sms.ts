import { smsMethods, smsPath } from '@ir-engine/common/src/schemas/user/sms.schema'

import { Application } from '../../../declarations'
import { SmsService } from './sms.class'
import smsDocs from './sms.docs'
import hooks from './sms.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [smsPath]: SmsService
  }
}

export default (app: Application): void => {
  app.use(smsPath, new SmsService(app), {
    // A list of all methods this service exposes externally
    methods: smsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: smsDocs
  })

  const service = app.service(smsPath)
  service.hooks(hooks)
}
