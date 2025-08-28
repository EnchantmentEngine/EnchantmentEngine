// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'

export const metabaseUrlPath = 'metabase-url'

export const metabaseUrlMethods = ['create'] as const

// Main data model schema
export const metabaseUrlDataSchema = Type.Object({}, { $id: 'MetabaseUrl', additionalProperties: true })
export interface MetabaseUrlData extends Static<typeof metabaseUrlDataSchema> {}

export const metabaseUrlQuerySchema = Type.Object(
  {
    action: Type.String()
  },
  { additionalProperties: false }
)
export interface MetabaseUrlQuery extends Static<typeof metabaseUrlQuerySchema> {}

export const metabaseUrlDataValidator = /* @__PURE__ */ getValidator(metabaseUrlDataSchema, dataValidator)
export const metabaseUrlQueryValidator = /* @__PURE__ */ getValidator(metabaseUrlQuerySchema, queryValidator)
