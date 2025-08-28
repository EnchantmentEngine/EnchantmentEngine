// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const staticResourceTypePath = 'static-resource-type'

export const staticResourceTypeMethods = ['find', 'get'] as const

export type StaticResourceTypes = 'asset' | 'scene' | 'avatar' | 'recording'

// Main data model schema
export const staticResourceTypeSchema = Type.Object(
  {
    type: TypedString<StaticResourceTypes>(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'StaticResourceType', additionalProperties: false }
)
export interface StaticResourceTypeType extends Static<typeof staticResourceTypeSchema> {}

// Schema for creating new entries
export const staticResourceTypeDataSchema = Type.Pick(staticResourceTypeSchema, ['type'], {
  $id: 'StaticResourceTypeData'
})
export interface StaticResourceTypeData extends Static<typeof staticResourceTypeDataSchema> {}

// Schema for updating existing entries
export const staticResourceTypePatchSchema = Type.Partial(staticResourceTypeSchema, {
  $id: 'StaticResourceTypePatch'
})
export interface StaticResourceTypePatch extends Static<typeof staticResourceTypePatchSchema> {}

// Schema for allowed query properties
export const staticResourceTypeQueryProperties = Type.Pick(staticResourceTypeSchema, ['type'])
export const staticResourceTypeQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface StaticResourceTypeQuery extends Static<typeof staticResourceTypeQuerySchema> {}

export const staticResourceTypeValidator = /* @__PURE__ */ getValidator(staticResourceTypeSchema, dataValidator)
export const staticResourceTypeDataValidator = /* @__PURE__ */ getValidator(staticResourceTypeDataSchema, dataValidator)
export const staticResourceTypePatchValidator = /* @__PURE__ */ getValidator(
  staticResourceTypePatchSchema,
  dataValidator
)
export const staticResourceTypeQueryValidator = /* @__PURE__ */ getValidator(
  staticResourceTypeQuerySchema,
  queryValidator
)
