import { acceptInviteMethods, acceptInvitePath } from '@ir-engine/common/src/schemas/user/accept-invite.schema'

import { Application } from '../../../declarations'
import { AcceptInviteService } from './accept-invite.class'
import acceptInviteDocs from './accept-invite.docs'
import hooks from './accept-invite.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [acceptInvitePath]: AcceptInviteService
  }
}

export default (app: Application): void => {
  app.use(acceptInvitePath, new AcceptInviteService(app), {
    // A list of all methods this service exposes externally
    methods: acceptInviteMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: acceptInviteDocs
  })

  const service = app.service(acceptInvitePath)
  service.hooks(hooks)
}
