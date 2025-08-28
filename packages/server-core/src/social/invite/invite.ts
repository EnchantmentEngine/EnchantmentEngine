import { Paginated } from '@feathersjs/feathers'

import { inviteMethods, invitePath, InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { InviteService } from './invite.class'
import inviteDocs from './invite.docs'
import hooks from './invite.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [invitePath]: InviteService
  }
}

export default (app: Application): void => {
  const options = {
    name: invitePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(invitePath, new InviteService(options), {
    // A list of all methods this service exposes externally
    methods: inviteMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: inviteDocs
  })

  const service = app.service(invitePath)
  service.hooks(hooks)

  /**
   * A method which is used to create invite
   *
   * @param data which is parsed to create invite
   * @returns created invite data
   */
  service.publish('created', async (data: InviteType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })) as Paginated<IdentityProviderType>
        if (inviteeIdentityProviderResult.total > 0) {
          targetIds.push(inviteeIdentityProviderResult.data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific invite
   *
   * @param data which contains userId and inviteeId
   * @returns deleted channel with invite data
   */

  service.publish('removed', async (data: InviteType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })) as Paginated<IdentityProviderType>
        if (inviteeIdentityProviderResult.total > 0) {
          targetIds.push(inviteeIdentityProviderResult.data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
