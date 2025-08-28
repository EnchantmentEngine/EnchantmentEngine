import { Paginated } from '@feathersjs/feathers'

import { avatarMethods, avatarPath, AvatarType } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { userAvatarPath, UserAvatarType } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { AvatarService } from './avatar.class'
import avatarDocs from './avatar.docs'
import hooks from './avatar.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [avatarPath]: AvatarService
  }
}

export default (app: Application): void => {
  const options = {
    name: avatarPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(avatarPath, new AvatarService(options), {
    // A list of all methods this service exposes externally
    methods: avatarMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: avatarDocs
  })

  const service = app.service(avatarPath)
  service.hooks(hooks)

  service.publish('patched', async (data: AvatarType, context) => {
    try {
      const { params } = context
      let targetIds = [params.user?.id]
      const usersWithAvatar = (
        (await app.service(userAvatarPath).find({
          ...context.params,
          query: {
            avatarId: data.id
          }
        })) as Paginated<UserAvatarType>
      ).data.map((item) => item.userId)
      targetIds = targetIds.concat(usersWithAvatar)
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
