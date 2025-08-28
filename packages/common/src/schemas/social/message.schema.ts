// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { ChannelID } from './channel.schema'

export const messagePath = 'message'

export const messageMethods = ['create', 'find'] as const
export type MessageID = OpaqueType<'MessageID'> & string

// Main data model schema
export const messageSchema = Type.Object(
  {
    id: TypedString<MessageID>({
      format: 'uuid'
    }),
    text: Type.String(),
    isNotification: Type.Boolean(),
    channelId: TypedString<ChannelID>({
      format: 'uuid'
    }),
    senderId: TypedString<UserID>({
      format: 'uuid'
    }),
    sender: Type.Ref(userSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Message' as MessageID, additionalProperties: false }
)
export interface MessageType extends Static<typeof messageSchema> {}

// Schema for creating new entries
export const messageDataProperties = Type.Partial(messageSchema)

export const messageDataSchema = Type.Intersect(
  [
    messageDataProperties,
    Type.Object({
      instanceId: Type.Optional(
        TypedString<InstanceID>({
          format: 'uuid'
        })
      )
    })
  ],
  {
    $id: 'MessageData',
    additionalProperties: false
  }
)
export interface MessageData extends Static<typeof messageDataSchema> {}

// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
})
export interface MessagePatch extends Static<typeof messagePatchSchema> {}

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, [
  'id',
  'text',
  'isNotification',
  'channelId',
  'senderId',
  'createdAt'
])
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties, {}),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MessageQuery extends Static<typeof messageQuerySchema> {}

export const messageValidator = /* @__PURE__ */ getValidator(messageSchema, dataValidator)
export const messageDataValidator = /* @__PURE__ */ getValidator(messageDataSchema, dataValidator)
export const messagePatchValidator = /* @__PURE__ */ getValidator(messagePatchSchema, dataValidator)
export const messageQueryValidator = /* @__PURE__ */ getValidator(messageQuerySchema, queryValidator)
