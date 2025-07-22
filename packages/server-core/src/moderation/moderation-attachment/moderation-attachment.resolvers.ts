import { resolve } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ModerationAttachmentQuery,
  ModerationAttachmentsType
} from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const moderationAttachmentResolver = resolve<ModerationAttachmentsType, HookContext>({})

export const moderationAttachmentExternalResolver = resolve<ModerationAttachmentsType, HookContext>({})

export const moderationAttachmentDataResolver = resolve<ModerationAttachmentsType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const moderationAttachmentPatchResolver = resolve<ModerationAttachmentsType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const moderationAttachmentQueryResolver = resolve<ModerationAttachmentQuery, HookContext>({})
