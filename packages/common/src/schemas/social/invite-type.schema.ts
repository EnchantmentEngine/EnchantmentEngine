// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const inviteTypePath = 'invite-type'

export const inviteTypeMethods = ['find', 'get'] as const

export const inviteTypes = ['friend', 'channel', 'location', 'instance', 'new-user']

// Main data model schema
export const inviteTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'InviteType', additionalProperties: false }
)
export interface InviteTypeType extends Static<typeof inviteTypeSchema> {}

// Schema for creating new entries
export const inviteTypeDataSchema = Type.Pick(inviteTypeSchema, ['type'], {
  $id: 'InviteTypeData'
})
export interface InviteTypeData extends Static<typeof inviteTypeDataSchema> {}

// Schema for updating existing entries
export const inviteTypePatchSchema = Type.Partial(inviteTypeSchema, {
  $id: 'InviteTypePatch'
})
export interface InviteTypePatch extends Static<typeof inviteTypePatchSchema> {}

// Schema for allowed query properties
export const inviteTypeQueryProperties = Type.Pick(inviteTypeSchema, ['type'])
export const inviteTypeQuerySchema = Type.Intersect(
  [
    querySyntax(inviteTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InviteTypeQuery extends Static<typeof inviteTypeQuerySchema> {}

export const inviteTypeValidator = /* @__PURE__ */ getValidator(inviteTypeSchema, dataValidator)
export const inviteTypeDataValidator = /* @__PURE__ */ getValidator(inviteTypeDataSchema, dataValidator)
export const inviteTypePatchValidator = /* @__PURE__ */ getValidator(inviteTypePatchSchema, dataValidator)
export const inviteTypeQueryValidator = /* @__PURE__ */ getValidator(inviteTypeQuerySchema, queryValidator)
