// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'
import { identityProviderTypes } from './identity-provider.schema'

export const generateTokenPath = 'generate-token'

export const generateTokenMethods = ['create'] as const

// Main data model schema
export const generateTokenSchema = Type.Object(
  {
    token: Type.String(),

    // @ts-ignore
    type: Type.Optional(StringEnum(identityProviderTypes))
  },
  { $id: 'GenerateToken', additionalProperties: false }
)
export interface GenerateTokenType extends Static<typeof generateTokenSchema> {}

// Schema for creating new entries
export const generateTokenDataSchema = Type.Pick(generateTokenSchema, ['token', 'type'], {
  $id: 'GenerateTokenData'
})
export interface GenerateTokenData extends Static<typeof generateTokenDataSchema> {}

// Schema for updating existing entries
export const generateTokenPatchSchema = Type.Partial(generateTokenSchema, {
  $id: 'GenerateTokenPatch'
})
export interface GenerateTokenPatch extends Static<typeof generateTokenPatchSchema> {}

// Schema for allowed query properties
export const generateTokenQueryProperties = Type.Pick(generateTokenSchema, ['token', 'type'])
export const generateTokenQuerySchema = Type.Intersect(
  [
    querySyntax(generateTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface GenerateTokenQuery extends Static<typeof generateTokenQuerySchema> {}

export const generateTokenValidator = /* @__PURE__ */ getValidator(generateTokenSchema, dataValidator)
export const generateTokenDataValidator = /* @__PURE__ */ getValidator(generateTokenDataSchema, dataValidator)
export const generateTokenPatchValidator = /* @__PURE__ */ getValidator(generateTokenPatchSchema, dataValidator)
export const generateTokenQueryValidator = /* @__PURE__ */ getValidator(generateTokenQuerySchema, queryValidator)
