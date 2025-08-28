// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { staticResourceSchema } from '../media/static-resource.schema'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const recordingPath = 'recording'

export const recordingMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

export type RecordingID = OpaqueType<'RecordingID'> & string

export const recordingSchemaType = Type.Object(
  {
    user: Type.Array(Type.String()),
    peers: Type.Record(Type.String(), Type.Array(Type.String()))
  },
  { $id: 'RecordingSchema', additionalProperties: false }
)
export interface RecordingSchemaType extends Static<typeof recordingSchemaType> {}

// Main data model schema
export const recordingSchema = Type.Object(
  {
    id: TypedString<RecordingID>({
      format: 'uuid'
    }),
    ended: Type.Boolean(),
    schema: Type.Ref(recordingSchemaType),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    resources: Type.Array(Type.Ref(staticResourceSchema)),
    userName: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Recording', additionalProperties: false }
)
export interface RecordingType extends Static<typeof recordingSchema> {}

export interface RecordingDatabaseType extends Omit<RecordingType, 'schema'> {
  schema: string
}

// Schema for creating new entries
export const recordingDataSchema = Type.Pick(recordingSchema, ['schema'], {
  $id: 'RecordingData'
})
export interface RecordingData extends Static<typeof recordingDataSchema> {}

// Schema for updating existing entries
export const recordingPatchSchema = Type.Partial(recordingSchema, {
  $id: 'RecordingPatch'
})
export interface RecordingPatch extends Static<typeof recordingPatchSchema> {}

// Schema for allowed query properties
export const recordingQueryProperties = Type.Pick(recordingSchema, ['id', 'userId', 'createdAt'])
export const recordingQuerySchema = Type.Intersect(
  [
    querySyntax(recordingQueryProperties),
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
export interface RecordingQuery extends Static<typeof recordingQuerySchema> {}

export const recordingSchemaValidator = /* @__PURE__ */ getValidator(recordingSchemaType, dataValidator)
export const recordingValidator = /* @__PURE__ */ getValidator(recordingSchema, dataValidator)
export const recordingDataValidator = /* @__PURE__ */ getValidator(recordingDataSchema, dataValidator)
export const recordingPatchValidator = /* @__PURE__ */ getValidator(recordingPatchSchema, dataValidator)
export const recordingQueryValidator = /* @__PURE__ */ getValidator(recordingQuerySchema, queryValidator)
