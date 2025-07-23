// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { ProjectSettingQuery, ProjectSettingType } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectSettingResolver = resolve<ProjectSettingType, HookContext>({
  createdAt: virtual(async (projectSetting) => fromDateTimeSql(projectSetting.createdAt)),
  updatedAt: virtual(async (projectSetting) => fromDateTimeSql(projectSetting.updatedAt))
})

export const projectSettingExternalResolver = resolve<ProjectSettingType, HookContext>({})

export const projectSettingDataResolver = resolve<ProjectSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const projectSettingPatchResolver = resolve<ProjectSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const projectSettingQueryResolver = resolve<ProjectSettingQuery, HookContext>({})
