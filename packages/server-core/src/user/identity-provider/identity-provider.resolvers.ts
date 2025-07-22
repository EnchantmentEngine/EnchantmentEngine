// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  IdentityProviderQuery,
  IdentityProviderType
} from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const identityProviderResolver = resolve<IdentityProviderType, HookContext>({
  createdAt: virtual(async (identityProvider) => fromDateTimeSql(identityProvider.createdAt)),
  updatedAt: virtual(async (identityProvider) => fromDateTimeSql(identityProvider.updatedAt))
})

export const identityProviderExternalResolver = resolve<IdentityProviderType, HookContext>({
  oauthToken: async () => undefined
})

export const identityProviderDataResolver = resolve<IdentityProviderType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const identityProviderPatchResolver = resolve<IdentityProviderType, HookContext>({
  updatedAt: getDateTimeSql
})

export const identityProviderQueryResolver = resolve<IdentityProviderQuery, HookContext>({})
