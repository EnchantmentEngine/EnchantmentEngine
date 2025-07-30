// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { UserApiKeyQuery, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const userApiKeyResolver = resolve<UserApiKeyType, HookContext>({
  createdAt: virtual(async (userApiKey) => fromDateTimeSql(userApiKey.createdAt)),
  updatedAt: virtual(async (userApiKey) => fromDateTimeSql(userApiKey.updatedAt))
})

export const userApiKeyExternalResolver = resolve<UserApiKeyType, HookContext>({})

export const userApiKeyDataResolver = resolve<UserApiKeyType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  token: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userApiKeyPatchResolver = resolve<UserApiKeyType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  token: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userApiKeyQueryResolver = resolve<UserApiKeyQuery, HookContext>({})
