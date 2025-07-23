// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { AvatarDatabaseType, AvatarID, AvatarQuery, AvatarType } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const avatarResolver = resolve<AvatarType, HookContext>({
  createdAt: virtual(async (avatar) => fromDateTimeSql(avatar.createdAt)),
  updatedAt: virtual(async (avatar) => fromDateTimeSql(avatar.updatedAt)),
  modelResource: virtual(async (avatar, context) => {
    if (context.event !== 'removed' && avatar.modelResourceId)
      try {
        return await context.app.service(staticResourcePath).get(avatar.modelResourceId)
      } catch (err) {
        //Swallow missing resource errors, deal with them elsewhere
      }
  }),
  thumbnailResource: virtual(async (avatar, context) => {
    if (context.event !== 'removed' && avatar.thumbnailResourceId)
      try {
        return await context.app.service(staticResourcePath).get(avatar.thumbnailResourceId)
      } catch (err) {
        //Swallow missing resource errors, deal with them elsewhere
      }
  })
})

export const avatarExternalResolver = resolve<AvatarType, HookContext>({
  user: virtual(async (avatar, context) => {
    if (context.params?.actualQuery?.skipUser) return {}
    if (avatar.userId) {
      try {
        return await context.app.service(userPath).get(avatar.userId, { query: { skipAvatar: true } })
      } catch (err) {
        return {}
      }
    }
  })
})

export const avatarDataResolver = resolve<AvatarDatabaseType, HookContext>({
  id: async () => {
    return uuidv4() as AvatarID
  },
  isPublic: async (isPublic) => {
    return isPublic ?? true
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const avatarPatchResolver = resolve<AvatarType, HookContext>({
  updatedAt: getDateTimeSql
})

export const avatarQueryResolver = resolve<AvatarQuery, HookContext>({})
