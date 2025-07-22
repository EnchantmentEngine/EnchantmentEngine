// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { userLoginPath } from '@ir-engine/common/src/schema.type.module'
import {
  ModerationID,
  ModerationQuery,
  ModerationType
} from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'
import { getCountryFromIP } from './ip-geolocation-helper'

const resolveUserEmail = async (userId: UserID | undefined, context: HookContext) => {
  if (!userId) return undefined

  const identityProvider = await context.app.service(identityProviderPath)._find({
    query: {
      userId: userId,
      $limit: 1
    }
  })
  return identityProvider?.data[0]?.email || undefined
}

const resolveUserIp = async (userId: UserID | undefined, context: HookContext) => {
  if (!userId) return undefined

  const lastLogin = await context.app.service(userLoginPath)._find({
    query: {
      userId: userId,
      $sort: { createdAt: -1 },
      $limit: 1
    }
  })
  return lastLogin?.data[0]?.ipAddress || undefined
}

export const moderationResolver = resolve<ModerationType, HookContext>({
  createdAt: virtual(async (moderation) => fromDateTimeSql(moderation.createdAt)),
  updatedAt: virtual(async (moderation) => fromDateTimeSql(moderation.updatedAt))
})

export const moderationExternalResolver = resolve<ModerationType, HookContext>({
  reportedUserEmail: virtual(async (moderation: ModerationType, context: HookContext) => {
    if (context.method === 'find') return resolveUserEmail(moderation.reportedUserId, context)
  }),
  createdByEmail: virtual(async (moderation: ModerationType, context: HookContext) => {
    if (context.method === 'find') return resolveUserEmail(moderation.createdBy, context)
  })
})
export const moderationDataResolver = resolve<ModerationType, HookContext>({
  id: async () => {
    return uuidv4() as ModerationID
  },
  reportedAt: getDateTimeSql,
  ipAddress: async (_, __, context) => {
    return context.params.forwarded?.ip || '::1'
  },
  reportedUserIpAddress: virtual(async (moderation: ModerationType, context: HookContext) => {
    return resolveUserIp(moderation.reportedUserId, context)
  }),
  reportingUserCountry: async (_, __, context) => {
    const ipAddress = context.params.forwarded?.ip || '::1'
    return await getCountryFromIP(ipAddress)
  },
  reportedUserCountry: virtual(async (moderation, context) => {
    const reportedUserIp = await resolveUserIp(moderation.reportedUserId, context)
    return await getCountryFromIP(reportedUserIp)
  }),
  createdBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const moderationPatchResolver = resolve<ModerationType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id
  },
  updatedAt: getDateTimeSql
})

export const moderationQueryResolver = resolve<ModerationQuery, HookContext>({})
