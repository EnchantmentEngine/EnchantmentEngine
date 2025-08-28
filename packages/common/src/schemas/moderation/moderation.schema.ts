// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { LocationID } from '@ir-engine/common/src/schema.type.module'
import { ABUSE_REASONS } from '../../constants/ModerationConstants'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const moderationPath = 'moderation'

export const moderationMethods = ['find', 'create', 'patch', 'remove'] as const

export type ModerationID = OpaqueType<'ModerationID'> & string

export type AbuseReasonsType = (typeof ABUSE_REASONS)[number]

const moderationTypes = ['user', 'location'] as const
export type ModerationTypeType = (typeof moderationTypes)[number]

// Main data model schema
export const moderationSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    type: StringEnum([...moderationTypes]),
    abuseReason: StringEnum([...ABUSE_REASONS]),
    reportedUserId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    reportedLocationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    ipAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportedUserIpAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportedUserCountry: Type.Optional(Type.String({ maxLength: 100 })),
    reportingUserCountry: Type.Optional(Type.String({ maxLength: 100 })),
    reportDetails: Type.String({ maxLength: 1050 }),
    status: StringEnum(['open', 'resolved']),
    reportedAt: Type.String({ format: 'date-time' }),
    createdBy: TypedString<UserID>({
      format: 'uuid'
    }),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    referenceNumber: Type.Integer(),
    reportedUserEmail: Type.Optional(Type.String()),
    createdByEmail: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Moderation', additionalProperties: false }
)
export interface ModerationType extends Static<typeof moderationSchema> {}

// Schema for creating new entries
export const moderationDataSchema = Type.Pick(
  moderationSchema,
  [
    'type',
    'reportedUserId',
    'reportedLocationId',
    'ipAddress',
    'abuseReason',
    'reportDetails',
    'reportedUserCountry',
    'reportingUserCountry'
  ],
  {
    $id: 'ModerationData'
  }
)
export interface ModerationData extends Static<typeof moderationDataSchema> {}

// Schema for updating existing entries
export const moderationPatchSchema = Type.Partial(
  Type.Pick(moderationSchema, [
    'status',
    'abuseReason',
    'reportDetails',
    'reportedUserCountry',
    'reportingUserCountry'
  ]),
  {
    $id: 'ModerationPatch'
  }
)
export interface ModerationPatch extends Static<typeof moderationPatchSchema> {}

// Schema for allowed query properties
export const moderationQueryProperties = Type.Pick(moderationSchema, [
  'id',
  'type',
  'referenceNumber',
  'reportedLocationId',
  'reportedUserId',
  'abuseReason',
  'status',
  'reportedUserCountry',
  'reportingUserCountry'
])
export const moderationQuerySchema = Type.Intersect(
  [
    querySyntax(moderationQueryProperties, {
      referenceNumber: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String()),
        search: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ModerationQuery extends Static<typeof moderationQuerySchema> {}

export const moderationValidator = /* @__PURE__ */ getValidator(moderationSchema, dataValidator)
export const moderationDataValidator = /* @__PURE__ */ getValidator(moderationDataSchema, dataValidator)
export const moderationPatchValidator = /* @__PURE__ */ getValidator(moderationPatchSchema, dataValidator)
export const moderationQueryValidator = /* @__PURE__ */ getValidator(moderationQuerySchema, queryValidator)
