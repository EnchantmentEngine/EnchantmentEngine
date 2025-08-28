// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { LocationID } from './location.schema'

export const locationAuthorizedUserPath = 'location-authorized-user'

export const locationAuthorizedUserMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const locationAuthorizedUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    locationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationAuthorizedUser', additionalProperties: false }
)
export interface LocationAuthorizedUserType extends Static<typeof locationAuthorizedUserSchema> {}

// Schema for creating new entries
export const locationAuthorizedUserDataSchema = Type.Pick(locationAuthorizedUserSchema, ['userId', 'locationId'], {
  $id: 'LocationAuthorizedUserData'
})
export interface LocationAuthorizedUserData extends Static<typeof locationAuthorizedUserDataSchema> {}

// Schema for updating existing entries
export const locationAuthorizedUserPatchSchema = Type.Partial(locationAuthorizedUserSchema, {
  $id: 'LocationAuthorizedUserPatch'
})
export interface LocationAuthorizedUserPatch extends Static<typeof locationAuthorizedUserPatchSchema> {}

// Schema for allowed query properties
export const locationAuthorizedUserQueryProperties = Type.Pick(locationAuthorizedUserSchema, [
  'id',
  'locationId',
  'userId'
])
export const locationAuthorizedUserQuerySchema = Type.Intersect(
  [
    querySyntax(locationAuthorizedUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export interface LocationAuthorizedUserQuery extends Static<typeof locationAuthorizedUserQuerySchema> {}

export const locationAuthorizedUserValidator = /* @__PURE__ */ getValidator(locationAuthorizedUserSchema, dataValidator)
export const locationAuthorizedUserDataValidator = /* @__PURE__ */ getValidator(
  locationAuthorizedUserDataSchema,
  dataValidator
)
export const locationAuthorizedUserPatchValidator = /* @__PURE__ */ getValidator(
  locationAuthorizedUserPatchSchema,
  dataValidator
)
export const locationAuthorizedUserQueryValidator = /* @__PURE__ */ getValidator(
  locationAuthorizedUserQuerySchema,
  queryValidator
)
