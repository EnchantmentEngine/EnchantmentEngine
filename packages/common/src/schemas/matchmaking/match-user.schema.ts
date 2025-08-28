// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const matchUserPath = 'match-user'

export const matchUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const matchUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    ticketId: Type.String({
      format: 'uuid'
    }),
    gameMode: Type.String(),
    connection: Type.String(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MatchUser', additionalProperties: false }
)
export interface MatchUserType extends Static<typeof matchUserSchema> {}

// Schema for creating new entries
export const matchUserDataSchema = Type.Pick(matchUserSchema, ['ticketId', 'gameMode', 'userId'], {
  $id: 'MatchUserData'
})
export interface MatchUserData extends Static<typeof matchUserDataSchema> {}

// Schema for updating existing entries
export const matchUserPatchSchema = Type.Partial(matchUserSchema, {
  $id: 'MatchUserPatch'
})
export interface MatchUserPatch extends Static<typeof matchUserPatchSchema> {}

// Schema for allowed query properties
export const matchUserQueryProperties = Type.Pick(matchUserSchema, ['id', 'ticketId', 'gameMode', 'connection'])
export const matchUserQuerySchema = Type.Intersect(
  [
    querySyntax(matchUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MatchUserQuery extends Static<typeof matchUserQuerySchema> {}

export const matchUserValidator = /* @__PURE__ */ getValidator(matchUserSchema, dataValidator)
export const matchUserDataValidator = /* @__PURE__ */ getValidator(matchUserDataSchema, dataValidator)
export const matchUserPatchValidator = /* @__PURE__ */ getValidator(matchUserPatchSchema, dataValidator)
export const matchUserQueryValidator = /* @__PURE__ */ getValidator(matchUserQuerySchema, queryValidator)
