import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ModerationBanID,
  ModerationBanQuery,
  ModerationBanType
} from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const moderationBanResolver = resolve<ModerationBanType, HookContext>({
  createdAt: virtual(async (moderation) => fromDateTimeSql(moderation.createdAt)),
  updatedAt: virtual(async (moderation) => fromDateTimeSql(moderation.updatedAt))
})
export const moderationBanExternalResolver = resolve<ModerationBanType, HookContext>({})
export const moderationBanDataResolver = resolve<ModerationBanType, HookContext>({
  id: async () => {
    return uuidv4() as ModerationBanID
  },
  reportedAt: getDateTimeSql,
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const moderationBanPatchResolver = resolve<ModerationBanType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id
  },
  updatedAt: getDateTimeSql
})

export const moderationBanQueryResolver = resolve<ModerationBanQuery, HookContext>({})
