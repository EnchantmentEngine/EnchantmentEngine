// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID, instanceSchema } from '../networking/instance.schema'
import { LocationID, locationSchema } from '../social/location.schema'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { botCommandDataSchema } from './bot-command.schema'

export const botPath = 'bot'

export const botMethods = ['create', 'find', 'patch', 'remove'] as const

// Main data model schema
export const botSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    description: Type.String(),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    locationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    botCommands: Type.Array(Type.Ref(botCommandDataSchema)),
    location: Type.Ref(locationSchema),
    instance: Type.Ref(instanceSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Bot', additionalProperties: false }
)
export interface BotType extends Static<typeof botSchema> {}

// Schema for creating new entries
export const botDataSchema = Type.Pick(
  botSchema,
  ['name', 'description', 'instanceId', 'locationId', 'userId', 'botCommands'],
  {
    $id: 'BotData'
  }
)
export interface BotData extends Static<typeof botDataSchema> {}

// Schema for updating existing entries
export const botPatchSchema = Type.Partial(botSchema, {
  $id: 'BotPatch'
})
export interface BotPatch extends Static<typeof botPatchSchema> {}

// Schema for allowed query properties
export const botQueryProperties = Type.Pick(botSchema, [
  'id',
  'name',
  'description',
  'instanceId',
  'locationId',
  'userId'
])
export const botQuerySchema = Type.Intersect(
  [
    querySyntax(botQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface BotQuery extends Static<typeof botQuerySchema> {}

export const botValidator = /* @__PURE__ */ getValidator(botSchema, dataValidator)
export const botDataValidator = /* @__PURE__ */ getValidator(botDataSchema, dataValidator)
export const botPatchValidator = /* @__PURE__ */ getValidator(botPatchSchema, dataValidator)
export const botQueryValidator = /* @__PURE__ */ getValidator(botQuerySchema, queryValidator)
