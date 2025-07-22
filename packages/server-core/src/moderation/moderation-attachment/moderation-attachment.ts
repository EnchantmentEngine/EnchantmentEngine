import { Application } from '@feathersjs/koa'

import {
  moderationAttachmentMethods,
  moderationAttachmentPath
} from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import { ModerationAttachmentService } from './moderation-attachment.class'
import moderationAttachmentDocs from './moderation-attachment.docs'
import hooks from './moderation-attachment.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [moderationAttachmentPath]: ModerationAttachmentService
  }
}

export default (app: Application): void => {
  const options = {
    name: moderationAttachmentPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(moderationAttachmentPath, new ModerationAttachmentService(options), {
    // A list of all methods this service exposes externally
    methods: moderationAttachmentMethods,
    // You can add additional custom events to be sent to client here
    events: [],
    docs: moderationAttachmentDocs
  })

  const service = app.service(moderationAttachmentPath)
  service.hooks(hooks)
}
