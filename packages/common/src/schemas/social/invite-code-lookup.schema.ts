import { getValidator, querySyntax, Static, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { instanceAttendanceSchema } from '../networking/instance-attendance.schema'
import { InviteCode, UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const inviteCodeLookupPath = 'invite-code-lookup'

export const inviteCodeLookupMethods = ['find'] as const

// Main data model schema
export const inviteCodeLookupSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    inviteCode: TypedString<InviteCode>(),
    instanceAttendance: Type.Array(Type.Ref(instanceAttendanceSchema))
  },
  { $id: 'InviteCodeLookup', additionalProperties: false }
)
export interface InviteCodeLookupType extends Static<typeof inviteCodeLookupSchema> {}

// Schema for allowed query properties
export const inviteCodeLookupQueryProperties = Type.Pick(inviteCodeLookupSchema, ['inviteCode'])
export const inviteCodeLookupQuerySchema = Type.Intersect(
  [
    querySyntax(inviteCodeLookupQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InviteCodeLookupQuery extends Static<typeof inviteCodeLookupQuerySchema> {}

export const inviteCodeLookupValidator = /* @__PURE__ */ getValidator(inviteCodeLookupSchema, dataValidator)
export const inviteCodeLookupQueryValidator = /* @__PURE__ */ getValidator(inviteCodeLookupQuerySchema, queryValidator)
