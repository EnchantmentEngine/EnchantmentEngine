// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userApiKeyPath = 'user-api-key'

export const userApiKeyMethods = ['find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const userApiKeySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.String(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserApiKey', additionalProperties: false }
)
export interface UserApiKeyType extends Static<typeof userApiKeySchema> {}

// Schema for creating new entries
export const userApiKeyDataSchema = Type.Partial(Type.Pick(userApiKeySchema, ['userId']), {
  $id: 'UserApiKeyData'
})
export interface UserApiKeyData extends Static<typeof userApiKeyDataSchema> {}

// Schema for updating existing entries
export const userApiKeyPatchSchema = Type.Partial(userApiKeySchema, {
  $id: 'UserApiKeyPatch'
})
export interface UserApiKeyPatch extends Static<typeof userApiKeyPatchSchema> {}

// Schema for allowed query properties
export const userApiKeyQueryProperties = Type.Pick(userApiKeySchema, ['id', 'token', 'userId'])
export const userApiKeyQuerySchema = Type.Intersect(
  [
    querySyntax(userApiKeyQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserApiKeyQuery extends Static<typeof userApiKeyQuerySchema> {}

export const userApiKeyValidator = /* @__PURE__ */ getValidator(userApiKeySchema, dataValidator)
export const userApiKeyDataValidator = /* @__PURE__ */ getValidator(userApiKeyDataSchema, dataValidator)
export const userApiKeyPatchValidator = /* @__PURE__ */ getValidator(userApiKeyPatchSchema, dataValidator)
export const userApiKeyQueryValidator = /* @__PURE__ */ getValidator(userApiKeyQuerySchema, queryValidator)
