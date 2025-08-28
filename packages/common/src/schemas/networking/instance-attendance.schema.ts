// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { PeerID } from '@ir-engine/hyperflux'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { InstanceID, instanceSchema } from './instance.schema'

export const instanceAttendancePath = 'instance-attendance'

export const instanceAttendanceMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const instanceAttendanceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    sceneId: Type.Optional(Type.String()),
    isChannel: Type.Boolean(),
    ended: Type.Boolean(),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    peerId: TypedString<PeerID>(),
    peerIndex: Type.Number(),
    instance: Type.Ref(instanceSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'InstanceAttendance', additionalProperties: false }
)
export interface InstanceAttendanceType extends Static<typeof instanceAttendanceSchema> {}

// Schema for creating new entries
export const instanceAttendanceDataSchema = Type.Pick(
  instanceAttendanceSchema,
  ['isChannel', 'instanceId', 'userId', 'peerId', 'sceneId'],
  {
    $id: 'InstanceAttendanceData'
  }
)
export interface InstanceAttendanceData extends Static<typeof instanceAttendanceDataSchema> {}

// Schema for updating existing entries
export const instanceAttendancePatchSchema = Type.Partial(instanceAttendanceSchema, {
  $id: 'InstanceAttendancePatch'
})
export interface InstanceAttendancePatch extends Static<typeof instanceAttendancePatchSchema> {}

// Schema for allowed query properties
export const instanceAttendanceQueryProperties = Type.Pick(instanceAttendanceSchema, [
  'id',
  'sceneId',
  'isChannel',
  'ended',
  'updatedAt',
  'instanceId',
  'peerId',
  'peerIndex',
  'userId'
])
export const instanceAttendanceQuerySchema = Type.Intersect(
  [
    querySyntax(instanceAttendanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InstanceAttendanceQuery extends Static<typeof instanceAttendanceQuerySchema> {}

export const instanceAttendanceValidator = /* @__PURE__ */ getValidator(instanceAttendanceSchema, dataValidator)
export const instanceAttendanceDataValidator = /* @__PURE__ */ getValidator(instanceAttendanceDataSchema, dataValidator)
export const instanceAttendancePatchValidator = /* @__PURE__ */ getValidator(
  instanceAttendancePatchSchema,
  dataValidator
)
export const instanceAttendanceQueryValidator = /* @__PURE__ */ getValidator(
  instanceAttendanceQuerySchema,
  queryValidator
)
