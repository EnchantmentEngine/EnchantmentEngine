// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { LocationAdminQuery, LocationAdminType } from '@ir-engine/common/src/schemas/social/location-admin.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const locationAdminResolver = resolve<LocationAdminType, HookContext>({
  createdAt: virtual(async (locationAdmin) => fromDateTimeSql(locationAdmin.createdAt)),
  updatedAt: virtual(async (locationAdmin) => fromDateTimeSql(locationAdmin.updatedAt))
})

export const locationAdminExternalResolver = resolve<LocationAdminType, HookContext>({})

export const locationAdminDataResolver = resolve<LocationAdminType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationAdminPatchResolver = resolve<LocationAdminType, HookContext>({
  updatedAt: getDateTimeSql
})

export const locationAdminQueryResolver = resolve<LocationAdminQuery, HookContext>({})
