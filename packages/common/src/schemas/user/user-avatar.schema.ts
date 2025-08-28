// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { avatarDataSchema, AvatarID } from './avatar.schema'
import { UserID } from './user.schema'

export const userAvatarPath = 'user-avatar'

export const userAvatarMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const userAvatarSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>(),
    avatarId: TypedString<AvatarID>({
      format: 'uuid'
    }),
    avatar: Type.Ref(avatarDataSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserAvatar', additionalProperties: false }
)
export interface UserAvatarType extends Static<typeof userAvatarSchema> {}

// Schema for creating new entries
export const userAvatarDataSchema = Type.Pick(userAvatarSchema, ['userId', 'avatarId'], {
  $id: 'UserAvatarData'
})
export interface UserAvatarData extends Static<typeof userAvatarDataSchema> {}

// Schema for updating existing entries
export const userAvatarPatchSchema = Type.Partial(userAvatarSchema, {
  $id: 'UserAvatarPatch'
})
export interface UserAvatarPatch extends Static<typeof userAvatarPatchSchema> {}

// Schema for allowed query properties
export const userAvatarQueryProperties = Type.Pick(userAvatarSchema, ['id', 'userId', 'avatarId'])
export const userAvatarQuerySchema = Type.Intersect(
  [
    querySyntax(userAvatarQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserAvatarQuery extends Static<typeof userAvatarQuerySchema> {}

export const userAvatarValidator = /* @__PURE__ */ getValidator(userAvatarSchema, dataValidator)
export const userAvatarDataValidator = /* @__PURE__ */ getValidator(userAvatarDataSchema, dataValidator)
export const userAvatarPatchValidator = /* @__PURE__ */ getValidator(userAvatarPatchSchema, dataValidator)
export const userAvatarQueryValidator = /* @__PURE__ */ getValidator(userAvatarQuerySchema, queryValidator)
