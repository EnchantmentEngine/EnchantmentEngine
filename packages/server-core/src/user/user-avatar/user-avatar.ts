import { Knex } from 'knex'
import _ from 'lodash-es'

import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'
import {
  userAvatarMethods,
  userAvatarPath,
  UserAvatarType
} from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'
import logger from '../../ServerLogger'
import { UserAvatarService } from './user-avatar.class'
import userAvatarDocs from './user-avatar.docs'
import hooks from './user-avatar.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userAvatarPath]: UserAvatarService
  }
}

export default (app: Application): void => {
  const options = {
    name: userAvatarPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userAvatarPath, new UserAvatarService(options), {
    // A list of all methods this service exposes externally
    methods: userAvatarMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userAvatarDocs
  })

  const service = app.service(userAvatarPath)
  service.hooks(hooks)

  // when seeding db, no need to patch users
  if (config.db.forceRefresh) return

  /**
   * This method find all users
   * @returns users
   */
  service.publish('patched', async (data: UserAvatarType) => {
    try {
      const userId = data.userId

      const instances = (await app.service(instanceAttendancePath).find({
        query: {
          userId,
          ended: false
        },
        paginate: false
      })) as any as InstanceAttendanceType[]

      const knexClient: Knex = app.get('knexClient')

      const layerUsers = await knexClient
        .from(userAvatarPath)
        .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, '=', `${userAvatarPath}.userId`)
        .whereIn(
          `${instanceAttendancePath}.instanceId`,
          instances.map((instance) => instance.instanceId)
        )
        .whereNot(`${userAvatarPath}.userId`, userId)
        .select()
        .options({ nestTables: true })

      const targetIds = _.uniq(layerUsers.map((item) => item[userAvatarPath].userId))

      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
