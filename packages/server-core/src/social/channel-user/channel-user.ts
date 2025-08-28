import { channelUserMethods, channelUserPath } from '@ir-engine/common/src/schemas/social/channel-user.schema'

import { Application } from '../../../declarations'
import { ChannelUserService } from './channel-user.class'
import channelUserDocs from './channel-user.docs'
import hooks from './channel-user.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [channelUserPath]: ChannelUserService
  }
}

/**
 * @todo
 * - destroy channel after last person leaves
 */

export default (app: Application): void => {
  const options = {
    name: channelUserPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(channelUserPath, new ChannelUserService(options), {
    // A list of all methods this service exposes externally
    methods: channelUserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: channelUserDocs
  })

  const service = app.service(channelUserPath)
  service.hooks(hooks)
}
