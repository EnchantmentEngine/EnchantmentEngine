// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { staticResourceSchema } from '../media/static-resource.schema'
import { dataValidator, queryValidator } from '../validators'
import { RecordingID } from './recording.schema'

export const recordingResourcePath = 'recording-resource'

export const recordingResourceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const recordingResourceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    recordingId: TypedString<RecordingID>({
      format: 'uuid'
    }),
    staticResourceId: Type.String({
      format: 'uuid'
    }),
    staticResource: Type.Ref(staticResourceSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'RecordingResource', additionalProperties: false }
)
export interface RecordingResourceType extends Static<typeof recordingResourceSchema> {}

// Schema for creating new entries
export const recordingResourceDataSchema = Type.Pick(recordingResourceSchema, ['recordingId', 'staticResourceId'], {
  $id: 'RecordingResourceData'
})
export interface RecordingResourceData extends Static<typeof recordingResourceDataSchema> {}

// Schema for updating existing entries
export const recordingResourcePatchSchema = Type.Partial(recordingResourceSchema, {
  $id: 'RecordingResourcePatch'
})
export interface RecordingResourcePatch extends Static<typeof recordingResourcePatchSchema> {}

// Schema for allowed query properties
export const recordingResourceQueryProperties = Type.Pick(recordingResourceSchema, [
  'id',
  'recordingId',
  'staticResourceId'
])
export const recordingResourceQuerySchema = Type.Intersect(
  [
    querySyntax(recordingResourceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface RecordingResourceQuery extends Static<typeof recordingResourceQuerySchema> {}

export const recordingResourceValidator = /* @__PURE__ */ getValidator(recordingResourceSchema, dataValidator)
export const recordingResourceDataValidator = /* @__PURE__ */ getValidator(recordingResourceDataSchema, dataValidator)
export const recordingResourcePatchValidator = /* @__PURE__ */ getValidator(recordingResourcePatchSchema, dataValidator)
export const recordingResourceQueryValidator = /* @__PURE__ */ getValidator(
  recordingResourceQuerySchema,
  queryValidator
)
