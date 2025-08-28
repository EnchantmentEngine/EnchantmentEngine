// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  UserSettingDatabaseType,
  UserSettingID,
  UserSettingQuery,
  UserSettingType
} from '@ir-engine/common/src/schemas/user/user-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const userDbToSchema = (rawData: UserSettingDatabaseType): UserSettingType => {
  let themeModes
  if (rawData.themeModes && typeof rawData.themeModes !== 'object')
    themeModes = JSON.parse(rawData.themeModes) as Record<string, string>

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof themeModes === 'string') {
    themeModes = JSON.parse(themeModes)

    // There are some old records in our database that requires further parsing.
    if (typeof themeModes === 'string') {
      themeModes = JSON.parse(themeModes)
    }
  }

  return {
    ...rawData,
    themeModes
  }
}

export const userSettingResolver = resolve<UserSettingType, HookContext>(
  {
    createdAt: virtual(async (userSetting) => fromDateTimeSql(userSetting.createdAt)),
    updatedAt: virtual(async (userSetting) => fromDateTimeSql(userSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return userDbToSchema(rawData)
    }
  }
)

export const userSettingExternalResolver = resolve<UserSettingType, HookContext>({})

export const userSettingDataResolver = resolve<UserSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4() as UserSettingID
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        themeModes: JSON.stringify(rawData.themeModes)
      }
    }
  }
)

export const userSettingPatchResolver = resolve<UserSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        themeModes: JSON.stringify(rawData.themeModes)
      }
    }
  }
)

export const userSettingQueryResolver = resolve<UserSettingQuery, HookContext>({})
