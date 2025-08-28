import { Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { locationAdminPath, LocationAdminType } from '@ir-engine/common/src/schemas/social/location-admin.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default () => {
  return async (context: HookContext<Application>) => {
    const { app, data, params } = context
    const loggedInUser = params.user as UserType
    const locationAdmins = (await app.service(locationAdminPath).find({
      query: {
        locationId: data.locationId,
        userId: loggedInUser.id
      }
    })) as Paginated<LocationAdminType>
    if (locationAdmins.total === 0) {
      throw new Forbidden('Not an admin of that location')
    }
    return context
  }
}
