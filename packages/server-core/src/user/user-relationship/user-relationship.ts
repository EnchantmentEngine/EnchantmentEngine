import {
  userRelationshipMethods,
  userRelationshipPath,
  UserRelationshipType
} from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserRelationshipService } from './user-relationship.class'
import userRelationshipDocs from './user-relationship.docs'
import hooks from './user-relationship.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userRelationshipPath]: UserRelationshipService
  }
}

export default (app: Application): void => {
  const options = {
    name: userRelationshipPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userRelationshipPath, new UserRelationshipService(options), {
    // A list of all methods this service exposes externally
    methods: userRelationshipMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userRelationshipDocs
  })

  const service = app.service(userRelationshipPath)
  service.hooks(hooks)

  service.publish('created', async (data: UserRelationshipType): Promise<any> => {
    try {
      const inverseRelationship = await app.service(userRelationshipPath).find({
        query: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'requested' && inverseRelationship.data.length > 0) {
        if (!data.user) data.user = await app.service(userPath).get(data.userId)
        if (!data.relatedUser) data.relatedUser = await app.service(userPath).get(data.relatedUserId)

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: UserRelationshipType): Promise<any> => {
    try {
      const inverseRelationship = await app.service(userRelationshipPath).find({
        query: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'friend' && inverseRelationship.data.length > 0) {
        if (!data.user) data.user = await app.service(userPath).get(data.userId)
        if (!data.relatedUser) data.relatedUser = await app.service(userPath).get(data.relatedUserId)

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('removed', async (data: UserRelationshipType): Promise<any> => {
    try {
      const targetIds = [data.userId, data.relatedUserId]
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
