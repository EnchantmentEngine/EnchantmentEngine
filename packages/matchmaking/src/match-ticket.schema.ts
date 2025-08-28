// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'

import { matchTicketAssignmentSchema } from './match-ticket-assignment.schema'

export const matchTicketPath = 'match-ticket'

export const matchTicketMethods = ['get', 'create', 'remove'] as const

export const matchSearchFieldsSchema = Type.Object(
  {
    tags: Type.Array(Type.String()),
    doubleArgs: Type.Optional(Type.Record(Type.String(), Type.Number())),
    stringArgs: Type.Optional(Type.Record(Type.String(), Type.String()))
  },
  { $id: 'MatchSearchFields', additionalProperties: false }
)
export interface MatchSearchFieldsType extends Static<typeof matchSearchFieldsSchema> {}

// Main data model schema
export const matchTicketSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    assignment: Type.Optional(Type.Ref(matchTicketAssignmentSchema)),
    searchFields: Type.Optional(Type.Ref(matchSearchFieldsSchema)),
    extensions: Type.Optional(
      Type.Record(
        Type.String(),
        Type.Object({
          typeUrl: Type.String(),
          value: Type.String()
        })
      )
    ),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'MatchTicket', additionalProperties: false }
)
export interface MatchTicketType extends Static<typeof matchTicketSchema> {}

// Schema for creating new entries
export const matchTicketDataSchema = Type.Object(
  {
    gameMode: Type.String(),
    attributes: Type.Optional(Type.Record(Type.String(), Type.String()))
  },
  {
    $id: 'MatchTicketData'
  }
)
export interface MatchTicketData extends Static<typeof matchTicketDataSchema> {}

// Schema for allowed query properties
export const matchTicketQueryProperties = Type.Pick(matchTicketSchema, [
  'id',
  // 'assignment',
  // 'searchFields',
  'extensions'
])
export const matchTicketQuerySchema = Type.Intersect(
  [
    querySyntax(matchTicketQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MatchTicketQuery extends Static<typeof matchTicketQuerySchema> {}

export const matchSearchFieldsValidator = /* @__PURE__ */ getValidator(matchSearchFieldsSchema, dataValidator)
export const matchTicketValidator = /* @__PURE__ */ getValidator(matchTicketSchema, dataValidator)
export const matchTicketDataValidator = /* @__PURE__ */ getValidator(matchTicketDataSchema, dataValidator)
export const matchTicketQueryValidator = /* @__PURE__ */ getValidator(matchTicketQuerySchema, queryValidator)
