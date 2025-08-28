// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userKickPath = 'user-kick'

export const userKickMethods = ['find', 'create', 'remove'] as const

export type UserKickID = OpaqueType<'UserKickID'> & string

// Main data model schema
export const userKickSchema = Type.Object(
  {
    id: TypedString<UserKickID>({
      format: 'uuid'
    }),
    duration: Type.String({ format: 'date-time' }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserKick', additionalProperties: false }
)
export interface UserKickType extends Static<typeof userKickSchema> {}

// Schema for creating new entries
export const userKickDataSchema = Type.Pick(userKickSchema, ['duration', 'userId', 'instanceId'], {
  $id: 'UserKickData'
})
export interface UserKickData extends Static<typeof userKickDataSchema> {}

// Schema for updating existing entries
export const userKickPatchSchema = Type.Partial(userKickSchema, {
  $id: 'UserKickPatch'
})
export interface UserKickPatch extends Static<typeof userKickPatchSchema> {}

// Schema for allowed query properties
export const userKickQueryProperties = Type.Pick(userKickSchema, ['id', 'duration', 'userId', 'instanceId'])
export const userKickQuerySchema = Type.Intersect(
  [
    querySyntax(userKickQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserKickQuery extends Static<typeof userKickQuerySchema> {}

export const userKickValidator = /* @__PURE__ */ getValidator(userKickSchema, dataValidator)
export const userKickDataValidator = /* @__PURE__ */ getValidator(userKickDataSchema, dataValidator)
export const userKickPatchValidator = /* @__PURE__ */ getValidator(userKickPatchSchema, dataValidator)
export const userKickQueryValidator = /* @__PURE__ */ getValidator(userKickQuerySchema, queryValidator)
