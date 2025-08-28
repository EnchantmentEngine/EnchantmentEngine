// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { InstanceID } from './instance.schema'

export const instanceAuthorizedUserPath = 'instance-authorized-user'

export const instanceAuthorizedUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const instanceAuthorizedUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'InstanceAuthorizedUser', additionalProperties: false }
)
export interface InstanceAuthorizedUserType extends Static<typeof instanceAuthorizedUserSchema> {}

// Schema for creating new entries
export const instanceAuthorizedUserDataSchema = Type.Pick(instanceAuthorizedUserSchema, ['userId', 'instanceId'], {
  $id: 'InstanceAuthorizedUserData'
})
export interface InstanceAuthorizedUserData extends Static<typeof instanceAuthorizedUserDataSchema> {}

// Schema for updating existing entries
export const instanceAuthorizedUserPatchSchema = Type.Partial(instanceAuthorizedUserSchema, {
  $id: 'InstanceAuthorizedUserPatch'
})
export interface InstanceAuthorizedUserPatch extends Static<typeof instanceAuthorizedUserPatchSchema> {}

// Schema for allowed query properties
export const instanceAuthorizedUserQueryProperties = Type.Pick(instanceAuthorizedUserSchema, [
  'id',
  'userId',
  'instanceId'
])
export const instanceAuthorizedUserQuerySchema = Type.Intersect(
  [
    querySyntax(instanceAuthorizedUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InstanceAuthorizedUserQuery extends Static<typeof instanceAuthorizedUserQuerySchema> {}

export const instanceAuthorizedUserValidator = /* @__PURE__ */ getValidator(instanceAuthorizedUserSchema, dataValidator)
export const instanceAuthorizedUserDataValidator = /* @__PURE__ */ getValidator(
  instanceAuthorizedUserDataSchema,
  dataValidator
)
export const instanceAuthorizedUserPatchValidator = /* @__PURE__ */ getValidator(
  instanceAuthorizedUserPatchSchema,
  dataValidator
)
export const instanceAuthorizedUserQueryValidator = /* @__PURE__ */ getValidator(
  instanceAuthorizedUserQuerySchema,
  queryValidator
)
