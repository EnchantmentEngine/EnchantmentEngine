// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { UserID } from '@ir-engine/hyperflux'
import { USERNAME_MAX_LENGTH } from '../../constants/UserConstants'
import { TypedString } from '../../types/TypeboxUtils'
import { ScopeType } from '../scope/scope.schema'
import { dataValidator, queryValidator } from '../validators'
import { userLoginSchema } from './user-login.schema'

/** @deprecated - import from @ir-engine/hyperflux */
export type { UserID }

export const userPath = 'user'

export const userMethods = ['get', 'find', 'create', 'patch'] as const

export const userScopeSchema = Type.Object(
  {
    type: TypedString<ScopeType>()
  },
  { $id: 'UserScope', additionalProperties: false }
)

export type InviteCode = OpaqueType<'InviteCode'> & string
export type UserName = OpaqueType<'UserName'> & string

// Main data model schema
export const userSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    name: TypedString<UserName>({
      maxLength: USERNAME_MAX_LENGTH
    }),
    // @todo consider moving this to user-settings and make private
    ageVerified: Type.Boolean(),
    isGuest: Type.Boolean(),
    inviteCode: Type.Optional(TypedString<InviteCode>()),
    lastLogin: Type.Optional(Type.Ref(userLoginSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    isDeactivated: Type.Optional(Type.Boolean()),
    deactivatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'User', additionalProperties: false }
)
export interface UserType extends Static<typeof userSchema> {}

// Schema for creating new entries
export const userDataSchema = Type.Partial(Type.Pick(userSchema, ['name', 'isGuest', 'inviteCode', 'ageVerified']), {
  $id: 'UserData'
})
export interface UserData extends Static<typeof userDataSchema> {}

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export interface UserPatch extends Static<typeof userPatchSchema> {}

export interface UserPublicPatch extends Pick<UserType, 'name' | 'id'> {}

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'name', 'isGuest', 'inviteCode', 'createdAt'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties, {
      id: {
        $like: Type.String()
      },
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        isDeactivated: Type.Optional(Type.Boolean()),
        search: Type.Optional(Type.String()),
        skipAvatar: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface UserQuery extends Static<typeof userQuerySchema> {}

export const userScopeValidator = /* @__PURE__ */ getValidator(userScopeSchema, dataValidator)
export const userValidator = /* @__PURE__ */ getValidator(userSchema, dataValidator)
export const userDataValidator = /* @__PURE__ */ getValidator(userDataSchema, dataValidator)
export const userPatchValidator = /* @__PURE__ */ getValidator(userPatchSchema, dataValidator)
export const userQueryValidator = /* @__PURE__ */ getValidator(userQuerySchema, queryValidator)
