// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { ChannelID } from './channel.schema'

export const channelUserPath = 'channel-user'

export const channelUserMethods = ['find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const channelUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    isOwner: Type.Boolean(),
    channelId: TypedString<ChannelID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    user: Type.Optional(Type.Ref(userSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ChannelUser', additionalProperties: false }
)
export interface ChannelUserType extends Static<typeof channelUserSchema> {}

// Schema for creating new entries
export const channelUserDataSchema = Type.Partial(
  Type.Intersect([
    Type.Pick(channelUserSchema, ['channelId', 'userId']),
    Type.Object(
      {
        isOwner: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ]),
  { $id: 'ChannelUserData' }
)
export interface ChannelUserData extends Static<typeof channelUserDataSchema> {}

// Schema for updating existing entries
export const channelUserPatchSchema = Type.Partial(channelUserSchema, {
  $id: 'ChannelUserPatch'
})
export interface ChannelUserPatch extends Static<typeof channelUserPatchSchema> {}

// Schema for allowed query properties
export const channelUserQueryProperties = Type.Pick(channelUserSchema, ['id', 'userId', 'isOwner', 'channelId'])
export const channelUserQuerySchema = Type.Intersect(
  [
    querySyntax(channelUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ChannelUserQuery extends Static<typeof channelUserQuerySchema> {}

export const channelUserValidator = /* @__PURE__ */ getValidator(channelUserSchema, dataValidator)
export const channelUserDataValidator = /* @__PURE__ */ getValidator(channelUserDataSchema, dataValidator)
export const channelUserPatchValidator = /* @__PURE__ */ getValidator(channelUserPatchSchema, dataValidator)
export const channelUserQueryValidator = /* @__PURE__ */ getValidator(channelUserQuerySchema, queryValidator)
