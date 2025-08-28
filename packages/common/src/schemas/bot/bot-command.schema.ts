// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const botCommandPath = 'bot-command'

export const botCommandMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const botCommandSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    description: Type.String(),
    botId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'BotCommand', additionalProperties: false }
)
export interface BotCommandType extends Static<typeof botCommandSchema> {}

// Schema for creating new entries
export const botCommandDataSchema = Type.Partial(botCommandSchema, {
  $id: 'BotCommandData'
})
export interface BotCommandData extends Static<typeof botCommandDataSchema> {}

// Schema for updating existing entries
export const botCommandPatchSchema = Type.Partial(botCommandSchema, {
  $id: 'BotCommandPatch'
})
export interface BotCommandPatch extends Static<typeof botCommandPatchSchema> {}

// Schema for allowed query properties
export const botCommandQueryProperties = Type.Pick(botCommandSchema, ['id', 'name', 'description', 'botId'])
export const botCommandQuerySchema = Type.Intersect(
  [
    querySyntax(botCommandQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface BotCommandQuery extends Static<typeof botCommandQuerySchema> {}

export const botCommandValidator = /* @__PURE__ */ getValidator(botCommandSchema, dataValidator)
export const botCommandDataValidator = /* @__PURE__ */ getValidator(botCommandDataSchema, dataValidator)
export const botCommandPatchValidator = /* @__PURE__ */ getValidator(botCommandPatchSchema, dataValidator)
export const botCommandQueryValidator = /* @__PURE__ */ getValidator(botCommandQuerySchema, queryValidator)
