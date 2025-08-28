import type { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Knex } from 'knex'

import { instanceAttendancePath } from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'
import { instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, locationPath, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { userRelationshipPath } from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'

export interface InstanceFriendsParams extends KnexAdapterParams {}

/**
 * A class for InstanceFriends service
 */

export class InstanceFriendsService implements ServiceInterface<InstanceType, InstanceFriendsParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: InstanceFriendsParams) {
    if (params!.user) throw new Error('User not found')
    try {
      const instances = (await this.app.service(instancePath).find({
        query: {
          ended: false
        },
        paginate: false
      })) as InstanceType[]

      const filteredInstances: InstanceType[] = []
      await Promise.all(
        instances.map(async (instance) => {
          const knexClient: Knex = this.app.get('knexClient')

          const instanceAttendance = await knexClient
            .from(instanceAttendancePath)
            .join(instancePath, `${instanceAttendancePath}.instanceId`, '=', `${instancePath}.id`)
            .join(userPath, `${instanceAttendancePath}.userId`, '=', `${userPath}.id`)
            .join(userRelationshipPath, `${userPath}.id`, '=', `${userRelationshipPath}.userId`)
            .where(`${instanceAttendancePath}.ended`, '=', false)
            .andWhere(`${instanceAttendancePath}.isChannel`, '=', false)
            .andWhere(`${instancePath}.id`, '=', instance.id)
            .andWhere(`${userRelationshipPath}.userRelationshipType`, '=', 'friend')
            .andWhere(`${userRelationshipPath}.relatedUserId`, '=', params!.user!.id)
            .select()
            .options({ nestTables: true })

          if (instanceAttendance.length > 0) {
            filteredInstances.push(instance)
          }
        })
      )

      // TODO: Populating location property here manually. Once instance service is moved to feathers 5. This should be part of its resolver.

      const locationIds = filteredInstances
        .map((instance) => (instance?.locationId ? instance.locationId : undefined))
        .filter((instance) => instance !== undefined) as LocationID[]

      const locations = (await this.app.service(locationPath).find({
        query: {
          id: {
            $in: locationIds
          }
        },
        paginate: false
      })) as LocationType[]

      for (const instance of filteredInstances) {
        if (instance && instance.locationId) {
          instance.location = locations.find((item) => item.id === instance.locationId)!
        }
      }

      return filteredInstances
    } catch (err) {
      console.log(err)
      return []
    }
  }
}
