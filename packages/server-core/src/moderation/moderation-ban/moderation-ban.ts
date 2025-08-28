import { moderationBanMethods, moderationBanPath } from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'

import { Application } from '../../../declarations'
import { ModerationBanService } from './moderation-ban.class'
import moderationBanDocs from './moderation-ban.docs'
import hooks from './moderation-ban.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [moderationBanPath]: ModerationBanService
  }
}

export default (app: Application): void => {
  const options = {
    name: moderationBanPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(moderationBanPath, new ModerationBanService(options), {
    // A list of all methods this service exposes externally
    methods: moderationBanMethods,
    // You can add additional custom events to be sent to client here
    events: [],
    docs: moderationBanDocs
  })

  const service = app.service(moderationBanPath)
  service.hooks(hooks)
}
