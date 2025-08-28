// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { identityProviderTypes } from '../user/identity-provider.schema'
import { InviteCode, UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { inviteTypes } from './invite-type.schema'

export const invitePath = 'invite'

export const inviteMethods = ['create', 'find', 'remove', 'patch', 'get'] as const

export const spawnDetailsSchema = Type.Object(
  {
    inviteCode: Type.Optional(TypedString<InviteCode>()),
    spawnPoint: Type.Optional(Type.String()),
    spectate: Type.Optional(Type.String())
  },
  { $id: 'SpawnDetails', additionalProperties: false }
)
export interface SpawnDetailsType extends Static<typeof spawnDetailsSchema> {}

// Main data model schema
export const inviteSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.Optional(Type.String()),

    // @ts-ignore
    identityProviderType: Type.Optional(StringEnum(identityProviderTypes)),
    passcode: Type.Optional(Type.String()),
    targetObjectId: Type.Optional(Type.String()),
    deleteOnUse: Type.Optional(Type.Boolean()),
    makeAdmin: Type.Optional(Type.Boolean()),
    spawnType: Type.Optional(Type.String()),
    spawnDetails: Type.Optional(Type.Ref(spawnDetailsSchema)),
    timed: Type.Optional(Type.Boolean()),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    inviteeId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    inviteType: StringEnum(inviteTypes),
    user: Type.Optional(Type.Ref(userSchema)),
    invitee: Type.Optional(Type.Ref(userSchema)),
    channelName: Type.Optional(Type.String()),
    startTime: Type.Optional(Type.String({ format: 'date-time' })),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Invite', additionalProperties: false }
)
export interface InviteType extends Static<typeof inviteSchema> {}

export interface InviteDatabaseType extends Omit<InviteType, 'spawnDetails'> {
  spawnDetails: string
}

// Schema for creating new entries
export const inviteDataProperties = Type.Pick(inviteSchema, [
  'token',
  'identityProviderType',
  'passcode',
  'targetObjectId',
  'deleteOnUse',
  'makeAdmin',
  'spawnType',
  'spawnDetails',
  'timed',
  'inviteeId',
  'inviteType',
  'startTime',
  'endTime'
])

export const inviteDataSchema = Type.Intersect(
  [
    inviteDataProperties,
    Type.Object(
      {
        userId: Type.Optional(
          TypedString<UserID>({
            format: 'uuid'
          })
        )
      },
      { additionalProperties: false }
    )
  ],
  {
    $id: 'InviteData'
  }
)
export interface InviteData extends Static<typeof inviteDataSchema> {}

// Schema for updating existing entries
export const invitePatchSchema = Type.Partial(inviteDataSchema, {
  $id: 'InvitePatch'
})
export interface InvitePatch extends Static<typeof invitePatchSchema> {}

// Schema for allowed query properties
export const inviteQueryProperties = Type.Pick(inviteSchema, [
  'id',
  'token',
  'identityProviderType',
  'passcode',
  'targetObjectId',
  'deleteOnUse',
  'makeAdmin',
  'spawnType',
  'timed',
  'userId',
  'inviteType',
  'inviteeId',
  'createdAt'
])
export const inviteQuerySchema = Type.Intersect(
  [
    querySyntax(inviteQueryProperties, {
      inviteType: {
        $like: Type.String()
      },
      passcode: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(StringEnum(['received', 'sent'])),
        search: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface InviteQuery extends Static<typeof inviteQuerySchema> {}

export const spawnDetailsValidator = /* @__PURE__ */ getValidator(spawnDetailsSchema, dataValidator)
export const inviteValidator = /* @__PURE__ */ getValidator(inviteSchema, dataValidator)
export const inviteDataValidator = /* @__PURE__ */ getValidator(inviteDataSchema, dataValidator)
export const invitePatchValidator = /* @__PURE__ */ getValidator(invitePatchSchema, dataValidator)
export const inviteQueryValidator = /* @__PURE__ */ getValidator(inviteQuerySchema, queryValidator)
