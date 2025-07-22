import {
  instanceFriendsMethods,
  instanceFriendsPath
} from '@ir-engine/common/src/schemas/networking/instance-friends.schema'

import { Application } from '../../../declarations'
import { InstanceFriendsService } from './instance-friends.class'
import instanceFriendsDocs from './instance-friends.docs'
import hooks from './instance-friends.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceFriendsPath]: InstanceFriendsService
  }
}

export default (app: Application): void => {
  app.use(instanceFriendsPath, new InstanceFriendsService(app), {
    // A list of all methods this service exposes externally
    methods: instanceFriendsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceFriendsDocs
  })

  const service = app.service(instanceFriendsPath)
  service.hooks(hooks)
}
