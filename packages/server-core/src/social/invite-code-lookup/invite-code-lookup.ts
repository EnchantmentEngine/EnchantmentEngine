import {
  inviteCodeLookupMethods,
  inviteCodeLookupPath
} from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'

import { Application } from '../../../declarations'
import { InviteCodeLookupService } from './invite-code-lookup.class'
import inviteCodeLookupDocs from './invite-code-lookup.docs'
import hooks from './invite-code-lookup.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [inviteCodeLookupPath]: InviteCodeLookupService
  }
}

export default (app: Application): void => {
  app.use(inviteCodeLookupPath, new InviteCodeLookupService(app), {
    // A list of all methods this service exposes externally
    methods: inviteCodeLookupMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: inviteCodeLookupDocs
  })

  const service = app.service(inviteCodeLookupPath)
  service.hooks(hooks)
}
