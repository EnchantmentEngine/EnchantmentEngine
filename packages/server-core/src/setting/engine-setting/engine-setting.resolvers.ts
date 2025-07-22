// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { EngineSettingQuery, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const engineSettingResolver = resolve<EngineSettingType, HookContext>({
  createdAt: virtual(async (engineSetting) => fromDateTimeSql(engineSetting.createdAt)),
  updatedAt: virtual(async (engineSetting) => fromDateTimeSql(engineSetting.updatedAt))
})

export const engineSettingExternalResolver = resolve<EngineSettingType, HookContext>({})

export const engineSettingDataResolver = resolve<EngineSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql,
  createdAt: getDateTimeSql
})

export const engineSettingPatchResolver = resolve<EngineSettingType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const engineSettingQueryResolver = resolve<EngineSettingQuery, HookContext>({})
