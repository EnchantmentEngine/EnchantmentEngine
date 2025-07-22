// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  LocationAuthorizedUserQuery,
  LocationAuthorizedUserType
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const locationAuthorizedUserResolver = resolve<LocationAuthorizedUserType, HookContext>({
  createdAt: virtual(async (locationAuthorizedUser) => fromDateTimeSql(locationAuthorizedUser.createdAt)),
  updatedAt: virtual(async (locationAuthorizedUser) => fromDateTimeSql(locationAuthorizedUser.updatedAt))
})

export const locationAuthorizedUserExternalResolver = resolve<LocationAuthorizedUserType, HookContext>({})

export const locationAuthorizedUserDataResolver = resolve<LocationAuthorizedUserType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationAuthorizedUserPatchResolver = resolve<LocationAuthorizedUserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const locationAuthorizedUserQueryResolver = resolve<LocationAuthorizedUserQuery, HookContext>({})
