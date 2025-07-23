import { moderationMethods, moderationPath } from '@ir-engine/common/src/schemas/moderation/moderation.schema'

import { Application } from '../../../declarations'
import { ModerationService } from './moderation.class'
import moderationDocs from './moderation.docs'
import hooks from './moderation.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [moderationPath]: ModerationService
  }
}

export default (app: Application): void => {
  const options = {
    name: moderationPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(moderationPath, new ModerationService(options), {
    // A list of all methods this service exposes externally
    methods: moderationMethods,
    // You can add additional custom events to be sent to client here
    events: [],
    docs: moderationDocs
  })

  const service = app.service(moderationPath)
  service.hooks(hooks)
}
