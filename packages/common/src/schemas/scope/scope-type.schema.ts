// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { ScopeType } from './scope.schema'

export const scopeTypePath = 'scope-type'

export const scopeTypeMethods = ['find', 'get'] as const

// Main data model schema
export const scopeTypeSchema = Type.Object(
  {
    type: TypedString<ScopeType>(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ScopeType', additionalProperties: false }
)
export interface ScopeTypeType extends Static<typeof scopeTypeSchema> {}

// Schema for creating new entries
export const scopeTypeDataSchema = Type.Pick(scopeTypeSchema, ['type'], {
  $id: 'ScopeTypeData'
})
export interface ScopeTypeData extends Static<typeof scopeTypeDataSchema> {}

// Schema for updating existing entries
export const scopeTypePatchSchema = Type.Partial(scopeTypeSchema, {
  $id: 'ScopeTypePatch'
})
export interface ScopeTypePatch extends Static<typeof scopeTypePatchSchema> {}

// Schema for allowed query properties
export const scopeTypeQueryProperties = Type.Pick(scopeTypeSchema, ['type'])
export const scopeTypeQuerySchema = Type.Intersect(
  [
    querySyntax(scopeTypeQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ScopeTypeQuery extends Static<typeof scopeTypeQuerySchema> {}

export const scopeTypeValidator = /* @__PURE__ */ getValidator(scopeTypeSchema, dataValidator)
export const scopeTypeDataValidator = /* @__PURE__ */ getValidator(scopeTypeDataSchema, dataValidator)
export const scopeTypePatchValidator = /* @__PURE__ */ getValidator(scopeTypePatchSchema, dataValidator)
export const scopeTypeQueryValidator = /* @__PURE__ */ getValidator(scopeTypeQuerySchema, queryValidator)
