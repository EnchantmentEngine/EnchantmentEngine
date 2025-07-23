import { channelUserPath, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { messageMethods, messagePath, MessageType } from '@ir-engine/common/src/schemas/social/message.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../../declarations'
import { MessageService } from './message.class'
import messageDocs from './message.docs'
import hooks from './message.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [messagePath]: MessageService
  }
}

export default (app: Application): void => {
  const options = {
    name: messagePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(messagePath, new MessageService(options), {
    // A list of all methods this service exposes externally
    methods: messageMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: messageDocs
  })

  const service = app.service(messagePath)
  service.hooks(hooks)

  const onCRUD =
    (app: Application) =>
    async (data: MessageType, context: HookContext): Promise<any> => {
      if (!data.sender && data.senderId) {
        data.sender = await app.service(userPath).get(data.senderId, { headers: context.params.headers })
      }
      const channelUsers = (await app.service(channelUserPath).find({
        query: {
          channelId: data.channelId
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
  service.publish('removed', onCRUD(app))
  service.publish('patched', onCRUD(app))
}
