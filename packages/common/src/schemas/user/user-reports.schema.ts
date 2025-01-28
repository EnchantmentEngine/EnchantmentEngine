/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userReportsPath = 'user-reports'

export const userReportsMethods = ['find', 'create', 'patch', 'remove'] as const

export type UserReportsID = OpaqueType<'UserReportsID'> & string

// Main data model schema
export const userReportsSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    type: Type.String({ maxLength: 255 }),
    UID: Type.String({ maxLength: 255 }),
    abuseReason: Type.String({ maxLength: 255 }),
    reportedUser: TypedString<UserID>({
      format: 'uuid'
    }),
    reportingUser: TypedString<UserID>({
      format: 'uuid'
    }),
    world: Type.Optional(Type.String({ maxLength: 255 })),
    ipAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportDetails: Type.String({ maxLength: 1050 }),
    status: Type.String({ maxLength: 255, default: 'Open' }),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserReports', additionalProperties: false }
)
export interface UserReportsType extends Static<typeof userReportsSchema> {}

// Schema for creating new entries
export const userReportsDataSchema = Type.Pick(
  userReportsSchema,
  ['type', 'reportedUser', 'reportingUser', 'UID', 'abuseReason', 'reportDetails'],
  {
    $id: 'UserReportsData'
  }
)
export interface UserReportsData extends Static<typeof userReportsDataSchema> {}

// Schema for updating existing entries
export const userReportsPatchSchema = Type.Partial(userReportsSchema, {
  $id: 'UserReportsPatch'
})
export interface UserReportsPatch extends Static<typeof userReportsPatchSchema> {}

// Schema for allowed query properties
export const userReportsQueryProperties = Type.Pick(userReportsSchema, [
  'id',
  'reportedUser',
  'reportingUser',
  'UID',
  'abuseReason',
  'status'
])
export const userReportsQuerySchema = Type.Intersect(
  [
    querySyntax(userReportsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserReportsQuery extends Static<typeof userReportsQuerySchema> {}

export const userReportsValidator = /* @__PURE__ */ getValidator(userReportsSchema, dataValidator)
export const userReportsDataValidator = /* @__PURE__ */ getValidator(userReportsDataSchema, dataValidator)
export const userReportsPatchValidator = /* @__PURE__ */ getValidator(userReportsPatchSchema, dataValidator)
export const userReportsQueryValidator = /* @__PURE__ */ getValidator(userReportsQuerySchema, queryValidator)
