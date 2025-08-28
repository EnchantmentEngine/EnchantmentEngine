// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const loginTokenPath = 'login-token'

export const loginTokenMethods = ['create'] as const

// Main data model schema
export const loginTokenSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.String(),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    expiresAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    associateUserId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    )
  },
  { $id: 'LoginToken', additionalProperties: false }
)
export interface LoginTokenType extends Static<typeof loginTokenSchema> {}

// Schema for creating new entries
export const loginTokenDataSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenData'
})
export interface LoginTokenData extends Static<typeof loginTokenDataSchema> {}

// Schema for updating existing entries
export const loginTokenPatchSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenPatch'
})
export interface LoginTokenPatch extends Static<typeof loginTokenPatchSchema> {}

// Schema for allowed query properties
export const loginTokenQueryProperties = Type.Pick(loginTokenSchema, [
  'id',
  'token',
  'identityProviderId',
  'associateUserId'
])
export const loginTokenQuerySchema = Type.Intersect(
  [
    querySyntax(loginTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface LoginTokenQuery extends Static<typeof loginTokenQuerySchema> {}

export const loginTokenValidator = /* @__PURE__ */ getValidator(loginTokenSchema, dataValidator)
export const loginTokenDataValidator = /* @__PURE__ */ getValidator(loginTokenDataSchema, dataValidator)
export const loginTokenPatchValidator = /* @__PURE__ */ getValidator(loginTokenPatchSchema, dataValidator)
export const loginTokenQueryValidator = /* @__PURE__ */ getValidator(loginTokenQuerySchema, queryValidator)
