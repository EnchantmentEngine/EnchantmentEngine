// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const invalidationPath = 'invalidation'

export const invalidationMethods = ['get', 'find', 'create', 'remove'] as const

// Main data model schema
export const invalidationSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    path: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Invalidation', additionalProperties: false }
)
export interface InvalidationType extends Static<typeof invalidationSchema> {}

// Schema for creating new entries
export const invalidationDataSchema = Type.Pick(invalidationSchema, ['path'], { $id: 'InvalidationData' })
export interface InvalidationData extends Static<typeof invalidationDataSchema> {}

// Schema for allowed query properties
export const invalidationQueryProperties = Type.Pick(invalidationSchema, ['id', 'path', 'createdAt'])
export const invalidationQuerySchema = Type.Intersect(
  [
    querySyntax(invalidationQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        path: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface InvalidationQuery extends Static<typeof invalidationQuerySchema> {}

export const invalidationValidator = /* @__PURE__ */ getValidator(invalidationSchema, dataValidator)
export const invalidationDataValidator = /* @__PURE__ */ getValidator(invalidationDataSchema, dataValidator)
export const invalidationQueryValidator = /* @__PURE__ */ getValidator(invalidationQuerySchema, queryValidator)
