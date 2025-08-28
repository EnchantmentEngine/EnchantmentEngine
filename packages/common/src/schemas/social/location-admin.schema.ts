// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { LocationID } from './location.schema'

export const locationAdminPath = 'location-admin'

export const locationAdminMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const locationAdminSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>(),
    locationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationAdmin', additionalProperties: false }
)
export interface LocationAdminType extends Static<typeof locationAdminSchema> {}

// Schema for creating new entries
export const locationAdminDataSchema = Type.Pick(locationAdminSchema, ['userId', 'locationId'], {
  $id: 'LocationAdminData'
})
export interface LocationAdminData extends Static<typeof locationAdminDataSchema> {}

// Schema for updating existing entries
export const locationAdminPatchSchema = Type.Partial(locationAdminSchema, {
  $id: 'LocationAdminPatch'
})
export interface LocationAdminPatch extends Static<typeof locationAdminPatchSchema> {}

// Schema for allowed query properties
export const locationAdminQueryProperties = Type.Pick(locationAdminSchema, ['id', 'userId', 'locationId'])
export const locationAdminQuerySchema = Type.Intersect(
  [
    querySyntax(locationAdminQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)

export interface LocationAdminQuery extends Static<typeof locationAdminQuerySchema> {}

export const locationAdminValidator = /* @__PURE__ */ getValidator(locationAdminSchema, dataValidator)
export const locationAdminDataValidator = /* @__PURE__ */ getValidator(locationAdminDataSchema, dataValidator)
export const locationAdminPatchValidator = /* @__PURE__ */ getValidator(locationAdminPatchSchema, dataValidator)
export const locationAdminQueryValidator = /* @__PURE__ */ getValidator(locationAdminQuerySchema, queryValidator)
