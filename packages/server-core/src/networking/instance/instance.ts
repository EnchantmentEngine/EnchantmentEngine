import { Paginated } from '@feathersjs/feathers'

import { instanceMethods, instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { scopePath, ScopeType, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { channelPath, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { Application, HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import { InstanceService } from './instance.class'
import instanceDocs from './instance.docs'
import hooks from './instance.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instancePath]: InstanceService
  }
}

export default (app: Application): void => {
  const options = {
    name: instancePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(instancePath, new InstanceService(options), {
    // A list of all methods this service exposes externally
    methods: instanceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceDocs
  })

  const service = app.service(instancePath)
  service.hooks(hooks)

  /**
   * A method used to remove specific instance
   *
   * @param data
   * @returns deleted channel
   */
  service.publish('removed', async (data, context: HookContext): Promise<any> => {
    try {
      const adminScopes = (await app.service(scopePath).find({
        query: {
          type: 'admin:admin' as ScopeType
        },
        headers: context.params.headers,
        paginate: false
      })) as unknown as ScopeTypeInterface[]

      const targetIds = adminScopes.map((admin) => admin.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
        targetIds.map((userId: UserID) =>
          app.channel(`userIds/${userId}`).send({
            instance: data
          })
        )
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: InstanceType): Promise<any> => {
    try {
      /** Remove channel if instance is a world server and it has ended */
      if (data.locationId && data.ended && !data.channelId) {
        const channel = (await app.service(channelPath).find({
          query: {
            instanceId: data.id,
            $limit: 1
          }
        })) as Paginated<ChannelType>
        if (isValidId(channel.data[0].id)) await app.service(channelPath).remove(channel.data[0].id)
      }
    } catch (e) {
      // fine - channel already cleaned up elsewhere
    }
  })
}
