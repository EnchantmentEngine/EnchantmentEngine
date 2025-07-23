import { inviteTypeMethods, inviteTypePath } from '@ir-engine/common/src/schemas/social/invite-type.schema'

import { Application } from '../../../declarations'
import { InviteTypeService } from './invite-type.class'
import inviteTypeDocs from './invite-type.docs'
import hooks from './invite-type.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [inviteTypePath]: InviteTypeService
  }
}

export default (app: Application): void => {
  const options = {
    id: 'type',
    name: inviteTypePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(inviteTypePath, new InviteTypeService(options), {
    // A list of all methods this service exposes externally
    methods: inviteTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: inviteTypeDocs
  })

  const service = app.service(inviteTypePath)
  service.hooks(hooks)
}
