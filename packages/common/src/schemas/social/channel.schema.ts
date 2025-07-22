// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { channelUserSchema } from './channel-user.schema'
import { messageSchema } from './message.schema'

export const channelPath = 'channel'

export const channelMethods = ['get', 'create', 'find', 'patch', 'remove'] as const

export type ChannelID = OpaqueType<'ChannelID'> & string

// Main data model schema
export const channelSchema = Type.Object(
  {
    id: TypedString<ChannelID>({
      format: 'uuid'
    }),
    name: Type.String(),
    instanceId: Type.Optional(
      TypedString<InstanceID>({
        format: 'uuid'
      })
    ),
    channelUsers: Type.Array(Type.Ref(channelUserSchema)),
    lastMessage: Type.Optional(Type.Ref(messageSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Channel', additionalProperties: false }
)
export interface ChannelType extends Static<typeof channelSchema> {}

// Schema for creating new entries
export const channelDataProperties = Type.Partial(Type.Pick(channelSchema, ['name', 'instanceId']))

export const channelDataSchema = Type.Intersect(
  [
    channelDataProperties,
    Type.Object({
      users: Type.Optional(
        Type.Array(
          TypedString<UserID>({
            format: 'uuid'
          })
        )
      )
    })
  ],
  {
    $id: 'ChannelData',
    additionalProperties: false
  }
)
export interface ChannelData extends Static<typeof channelDataSchema> {}

// Schema for updating existing entries
export const channelPatchSchema = Type.Partial(channelSchema, {
  $id: 'ChannelPatch'
})
export interface ChannelPatch extends Static<typeof channelPatchSchema> {}

// Schema for allowed query properties
export const channelQueryProperties = Type.Pick(channelSchema, ['id', 'name', 'instanceId'])
export const channelQuerySchema = Type.Intersect(
  [
    querySyntax(channelQueryProperties, {
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String()),
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ChannelQuery extends Static<typeof channelQuerySchema> {}

export const channelValidator = /* @__PURE__ */ getValidator(channelSchema, dataValidator)
export const channelDataValidator = /* @__PURE__ */ getValidator(channelDataSchema, dataValidator)
export const channelPatchValidator = /* @__PURE__ */ getValidator(channelPatchSchema, dataValidator)
export const channelQueryValidator = /* @__PURE__ */ getValidator(channelQuerySchema, queryValidator)
