// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const staticResourceTagPath = 'static-resource-tag'

export const staticResourceTagMethods = ['find'] as const

// Main data model schema
export const staticResourceTagSchema = Type.Object(
  {
    project: Type.String(),
    tag: Type.String(),
    count: Type.Number(),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'StaticResourceTag', additionalProperties: false }
)
export interface StaticResourceTagType extends Static<typeof staticResourceTagSchema> {}

// Query schema
export const staticResourceTagQueryProperties = Type.Pick(staticResourceTagSchema, [
  'project',
  'tag',
  'createdAt',
  'updatedAt'
])

export const staticResourceTagQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceTagQueryProperties, {
      tag: { $like: Type.String() }
    }),
    Type.Object(
      {
        q: Type.Optional(Type.String()),
        includeCount: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface StaticResourceTagQuery extends Static<typeof staticResourceTagQuerySchema> {}

export const staticResourceTagValidator = /* @__PURE__ */ getValidator(staticResourceTagSchema, dataValidator)
export const staticResourceTagQueryValidator = /* @__PURE__ */ getValidator(
  staticResourceTagQuerySchema,
  queryValidator
)
