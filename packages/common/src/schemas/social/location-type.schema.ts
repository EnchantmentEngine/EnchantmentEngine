// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const locationTypePath = 'location-type'

export const locationTypeMethods = ['find', 'get'] as const

// Main data model schema
export const locationTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'LocationType', additionalProperties: false }
)
export interface LocationTypeType extends Static<typeof locationTypeSchema> {}

// Schema for creating new entries
export const locationTypeDataSchema = Type.Pick(locationTypeSchema, ['type'], {
  $id: 'LocationTypeData'
})
export interface LocationTypeData extends Static<typeof locationTypeDataSchema> {}

// Schema for updating existing entries
export const locationTypePatchSchema = Type.Partial(locationTypeSchema, {
  $id: 'LocationTypePatch'
})
export interface LocationTypePatch extends Static<typeof locationTypePatchSchema> {}

// Schema for allowed query properties
export const locationTypeQueryProperties = Type.Pick(locationTypeSchema, ['type'])
export const locationTypeQuerySchema = Type.Intersect(
  [
    querySyntax(locationTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface LocationTypeQuery extends Static<typeof locationTypeQuerySchema> {}

export const locationTypeValidator = /* @__PURE__ */ getValidator(locationTypeSchema, dataValidator)
export const locationTypeDataValidator = /* @__PURE__ */ getValidator(locationTypeDataSchema, dataValidator)
export const locationTypePatchValidator = /* @__PURE__ */ getValidator(locationTypePatchSchema, dataValidator)
export const locationTypeQueryValidator = /* @__PURE__ */ getValidator(locationTypeQuerySchema, queryValidator)
