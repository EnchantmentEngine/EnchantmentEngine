import '@feathersjs/transport-commons'

import { channelUserPath, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { channelMethods, channelPath, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../../declarations'
import { ChannelService } from './channel.class'
import channelDocs from './channel.docs'
import hooks from './channel.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [channelPath]: ChannelService
  }
}

export default (app: Application): void => {
  const options = {
    name: channelPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(channelPath, new ChannelService(options), {
    // A list of all methods this service exposes externally
    methods: channelMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: channelDocs
  })

  const service = app.service(channelPath)
  service.hooks(hooks)

  const onCRUD =
    (app: Application) =>
    async (data: ChannelType, context: HookContext): Promise<any> => {
      const channelUsers = (await app.service(channelUserPath).find({
        query: {
          channelId: data.id
        },
        headers: context.params.headers,
        paginate: false
      })) as unknown as ChannelUserType[]

      const userIds = channelUsers.map((channelUser) => {
        return channelUser.userId
      })

      return Promise.all(userIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    }
  service.publish('created', onCRUD(app))
  service.publish('patched', onCRUD(app))
}
