// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userLoginPath = 'user-login'

export const userLoginMethods = ['find', 'create'] as const

// Main data model schema
export const userLoginSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userAgent: Type.String(),
    ipAddress: Type.String(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserLogin', additionalProperties: false }
)
export interface UserLoginType extends Static<typeof userLoginSchema> {}

// Schema for creating new entries
export const userLoginDataSchema = Type.Pick(
  userLoginSchema,
  ['userId', 'userAgent', 'ipAddress', 'identityProviderId'],
  {
    $id: 'UserLoginData'
  }
)
export interface UserLoginData extends Static<typeof userLoginDataSchema> {}

// Schema for updating existing entries
export const userLoginPatchSchema = Type.Partial(userLoginSchema, {
  $id: 'UserLoginPatch'
})
export interface UserLoginPatch extends Static<typeof userLoginPatchSchema> {}

// Schema for allowed query properties
export const userLoginQueryProperties = Type.Pick(userLoginSchema, [
  'id',
  'userId',
  'userAgent',
  'ipAddress',
  'identityProviderId',
  'createdAt'
])
export const userLoginQuerySchema = Type.Intersect(
  [
    querySyntax(userLoginQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserLoginQuery extends Static<typeof userLoginQuerySchema> {}

export const userLoginValidator = /* @__PURE__ */ getValidator(userLoginSchema, dataValidator)
export const userLoginDataValidator = /* @__PURE__ */ getValidator(userLoginDataSchema, dataValidator)
export const userLoginPatchValidator = /* @__PURE__ */ getValidator(userLoginPatchSchema, dataValidator)
export const userLoginQueryValidator = /* @__PURE__ */ getValidator(userLoginQuerySchema, queryValidator)
