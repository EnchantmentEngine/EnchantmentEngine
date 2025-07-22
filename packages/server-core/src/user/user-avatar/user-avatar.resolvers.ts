// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import { UserAvatarQuery, UserAvatarType } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const userAvatarResolver = resolve<UserAvatarType, HookContext>({
  createdAt: virtual(async (userAvatar) => fromDateTimeSql(userAvatar.createdAt)),
  updatedAt: virtual(async (userAvatar) => fromDateTimeSql(userAvatar.updatedAt))
})

export const userAvatarExternalResolver = resolve<UserAvatarType, HookContext>({
  avatar: virtual(async (userAvatar, context) => {
    if (context.event !== 'removed' && userAvatar.avatarId)
      try {
        return await context.app.service(avatarPath).get(userAvatar.avatarId, { query: { skipUser: true } })
      } catch (err) {
        return undefined
      }
  })
})

export const userAvatarDataResolver = resolve<UserAvatarType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userAvatarPatchResolver = resolve<UserAvatarType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userAvatarQueryResolver = resolve<UserAvatarQuery, HookContext>({})
