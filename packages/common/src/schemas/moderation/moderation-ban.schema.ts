import { getValidator, querySyntax, Static, StringEnum, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'
import { dataValidator, queryValidator } from '../validators'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { abuseReasons } from './moderation.schema'

export const moderationBanPath = 'moderation-ban'
export const moderationBanMethods = ['create', 'find', 'patch', 'remove'] as const

export type ModerationBanID = OpaqueType<'ModerationBanID'> & string

// Main data model schema
export const moderationBanSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    banUserId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    banReason: StringEnum([...abuseReasons]),
    ipAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportedAt: Type.String({ format: 'date-time' }),
    banned: Type.Boolean(),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ModerationBan', additionalProperties: false }
)

export interface ModerationBanType extends Static<typeof moderationBanSchema> {}
// Schema for creating new entries
export const moderationBanDataSchema = Type.Pick(
  moderationBanSchema,
  ['banUserId', 'banReason', 'ipAddress', 'reportedAt', 'banned'],
  { $id: 'ModerationBanData' }
)
export interface ModerationBanData extends Static<typeof moderationBanDataSchema> {}

// Schema for updating existing entries
export const moderationBanPatchSchema = Type.Partial(
  Type.Pick(moderationBanSchema, ['banned'], { $id: 'ModerationBanPatch' })
)
export interface ModerationBanPatch extends Static<typeof moderationBanPatchSchema> {}

// Schema for allowed query Properties

const moderationBanQueryProperties = Type.Pick(moderationBanSchema, ['id', 'banUserId', 'banned', 'banReason'])

export const moderationBanQuerySchema = Type.Intersect(
  [
    querySyntax(moderationBanQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ModerationBanQuery extends Static<typeof moderationBanQuerySchema> {}

export const moderationBanValidator = /* @__PURE__ */ getValidator(moderationBanSchema, dataValidator)
export const moderationBanDataValidator = /* @__PURE__ */ getValidator(moderationBanDataSchema, dataValidator)
export const moderationBanPatchValidator = /* @__PURE__ */ getValidator(moderationBanPatchSchema, dataValidator)
export const moderationBanQueryValidator = /* @__PURE__ */ getValidator(moderationBanQuerySchema, queryValidator)
