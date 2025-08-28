// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { LocationSettingQuery, LocationSettingType } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const locationSettingResolver = resolve<LocationSettingType, HookContext>({
  createdAt: virtual(async (locationSetting) => fromDateTimeSql(locationSetting.createdAt)),
  updatedAt: virtual(async (locationSetting) => fromDateTimeSql(locationSetting.updatedAt))
})

export const locationSettingExternalResolver = resolve<LocationSettingType, HookContext>({})

export const locationSettingDataResolver = resolve<LocationSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationSettingPatchResolver = resolve<LocationSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const locationSettingQueryResolver = resolve<LocationSettingQuery, HookContext>({})
