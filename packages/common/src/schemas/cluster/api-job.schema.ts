// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const apiJobPath = 'api-job'

export const apiJobMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const apiJobSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.String({ format: 'date-time' }),
    status: Type.String(),
    returnData: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ApiJob', additionalProperties: false }
)
export interface ApiJobType extends Static<typeof apiJobSchema> {}

// Schema for creating new entries
export const apiJobDataSchema = Type.Pick(apiJobSchema, ['name', 'startTime', 'endTime', 'status', 'returnData'], {
  $id: 'ApiJobData'
})
export interface ApiJobData extends Static<typeof apiJobDataSchema> {}

// Schema for updating existing entries
export const apiJobPatchSchema = Type.Partial(apiJobSchema, {
  $id: 'ApiJobPatch'
})
export interface ApiJobPatch extends Static<typeof apiJobPatchSchema> {}

// Schema for allowed query properties
export const apiJobQueryProperties = Type.Pick(apiJobSchema, [
  'id',
  'name',
  'startTime',
  'endTime',
  'status',
  'returnData'
])
export const apiJobQuerySchema = Type.Intersect(
  [
    querySyntax(apiJobQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ApiJobQuery extends Static<typeof apiJobQuerySchema> {}

export const apiJobValidator = /* @__PURE__ */ getValidator(apiJobSchema, dataValidator)
export const apiJobDataValidator = /* @__PURE__ */ getValidator(apiJobDataSchema, dataValidator)
export const apiJobPatchValidator = /* @__PURE__ */ getValidator(apiJobPatchSchema, dataValidator)
export const apiJobQueryValidator = /* @__PURE__ */ getValidator(apiJobQuerySchema, queryValidator)
