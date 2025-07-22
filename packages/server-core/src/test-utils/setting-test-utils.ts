import { Params } from '@feathersjs/feathers'
import { UserApiKeyType } from '@ir-engine/common/src/schema.type.module'
import {
  EngineSettingQuery,
  EngineSettingType,
  engineSettingPath
} from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import { createUser, getAuthParams } from './user-test-utils'

/**
 * Helper method used to create engine setting. If params are not provided then it will create random ones.
 * @param app
 * @param key
 * @param value
 * @param type
 * @param category
 * @param user
 * @returns
 */
export const createEngineSetting = async (
  app: Application,
  key: string,
  value: string,
  type: EngineSettingType['type'],
  category: EngineSettingType['category'],
  user?: UserType
) => {
  if (!user) {
    user = await createUser(app)
  }

  const engineSetting = await app.service(engineSettingPath).create(
    {
      key,
      value,
      type,
      category,
      dataType: 'string'
    },
    {
      user
    }
  )

  return { engineSetting, user }
}

/**
 * Helper method used to get engine setting.
 * @param app
 * @param engineSettingId
 * @returns
 */
export const getEngineSetting = async (app: Application, engineSettingId: string) => {
  const engineSetting = await app.service(engineSettingPath).get(engineSettingId)
  return engineSetting
}

/**
 * Helper method used to find engine setting.
 * @param app
 * @param query
 * @param user
 * @returns
 */
export const findEngineSetting = async (app: Application, query: EngineSettingQuery, userApiKey?: UserApiKeyType) => {
  let params: Params = {}

  if (userApiKey) {
    params = getAuthParams(userApiKey)
  }

  const engineSetting = await app.service(engineSettingPath).find({
    query: {
      ...query
    },
    ...params
  })
  return engineSetting
}

/**
 * Helper method used to patch engine setting.
 * @param app
 * @param engineSettingId
 * @param key
 * @param category
 * @returns
 */
export const patchEngineSetting = async (
  app: Application,
  value: string,
  engineSettingId?: string,
  key?: string,
  category?: EngineSettingType['category']
) => {
  const query = {} as EngineSettingQuery

  if (key) {
    query.key = key
  }

  if (category) {
    query.category = category
  }

  const engineSetting = await app.service(engineSettingPath).patch(
    engineSettingId ?? null,
    {
      value
    },
    {
      query
    }
  )

  return engineSetting
}

/**
 * Helper method used to remove engine setting.
 * @param app
 * @param engineSettingId
 * @param engineSetting
 * @returns
 */
export const removeEngineSetting = async (app: Application, engineSettingId?: string, query?: EngineSettingQuery) => {
  const engineSetting = await app.service(engineSettingPath).remove(engineSettingId ?? null, {
    query: {
      ...query
    }
  })
  return engineSetting
}
