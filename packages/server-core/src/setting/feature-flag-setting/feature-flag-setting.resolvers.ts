// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  FeatureFlagSettingQuery,
  FeatureFlagSettingType
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

export const featureFlagSettingResolver = resolve<FeatureFlagSettingType, HookContext>({
  createdAt: virtual(async (featureFlagSetting) => fromDateTimeSql(featureFlagSetting.createdAt)),
  updatedAt: virtual(async (featureFlagSettings) => fromDateTimeSql(featureFlagSettings.updatedAt))
})

export const featureFlagSettingExternalResolver = resolve<FeatureFlagSettingType, HookContext>({
  flagValue: async (_, setting) => !!setting.flagValue
})

export const featureFlagSettingDataResolver = resolve<FeatureFlagSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const featureFlagSettingPatchResolver = resolve<FeatureFlagSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const featureFlagSettingQueryResolver = resolve<FeatureFlagSettingQuery, HookContext>({})
