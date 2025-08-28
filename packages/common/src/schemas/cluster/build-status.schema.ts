// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const buildStatusPath = 'build-status'

export const buildStatusMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const buildStatusSchema = Type.Object(
  {
    id: Type.Integer(),
    status: Type.String(),
    dateStarted: Type.String(),
    dateEnded: Type.String(),
    logs: Type.String(),
    commitSHA: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'BuildStatus', additionalProperties: false }
)
export interface BuildStatusType extends Static<typeof buildStatusSchema> {}

// Schema for creating new entries
export const buildStatusDataSchema = Type.Pick(
  buildStatusSchema,
  ['status', 'dateStarted', 'dateEnded', 'logs', 'commitSHA'],
  {
    $id: 'BuildStatusData'
  }
)
export interface BuildStatusData extends Static<typeof buildStatusDataSchema> {}

// Schema for updating existing entries
export const buildStatusPatchSchema = Type.Partial(buildStatusSchema, {
  $id: 'BuildStatusPatch'
})
export interface BuildStatusPatch extends Static<typeof buildStatusPatchSchema> {}

// Schema for allowed query properties
export const buildStatusQueryProperties = Type.Pick(buildStatusSchema, [
  'id',
  'status',
  'dateStarted',
  'dateEnded',
  'logs',
  'commitSHA'
])
export const buildStatusQuerySchema = Type.Intersect(
  [
    querySyntax(buildStatusQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface BuildStatusQuery extends Static<typeof buildStatusQuerySchema> {}

export const buildStatusValidator = /* @__PURE__ */ getValidator(buildStatusSchema, dataValidator)
export const buildStatusDataValidator = /* @__PURE__ */ getValidator(buildStatusDataSchema, dataValidator)
export const buildStatusPatchValidator = /* @__PURE__ */ getValidator(buildStatusPatchSchema, dataValidator)
export const buildStatusQueryValidator = /* @__PURE__ */ getValidator(buildStatusQuerySchema, queryValidator)
