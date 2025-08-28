// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const matchInstancePath = 'match-instance'

export const matchInstanceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const matchInstanceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    connection: Type.String(),
    gameMode: Type.Optional(Type.String()),
    instanceServer: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MatchInstance', additionalProperties: false }
)
export interface MatchInstanceType extends Static<typeof matchInstanceSchema> {}

// Schema for creating new entries
export const matchInstanceDataSchema = Type.Pick(matchInstanceSchema, ['connection', 'gameMode', 'instanceServer'], {
  $id: 'MatchInstanceData'
})
export interface MatchInstanceData extends Static<typeof matchInstanceDataSchema> {}

// Schema for updating existing entries
export const matchInstancePatchSchema = Type.Partial(matchInstanceSchema, {
  $id: 'MatchInstancePatch'
})
export interface MatchInstancePatch extends Static<typeof matchInstancePatchSchema> {}

// Schema for allowed query properties
export const matchInstanceQueryProperties = Type.Pick(matchInstanceSchema, [
  'id',
  'connection',
  'gameMode',
  'instanceServer'
])
export const matchInstanceQuerySchema = Type.Intersect(
  [
    querySyntax(matchInstanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MatchInstanceQuery extends Static<typeof matchInstanceQuerySchema> {}

export const matchInstanceValidator = /* @__PURE__ */ getValidator(matchInstanceSchema, dataValidator)
export const matchInstanceDataValidator = /* @__PURE__ */ getValidator(matchInstanceDataSchema, dataValidator)
export const matchInstancePatchValidator = /* @__PURE__ */ getValidator(matchInstancePatchSchema, dataValidator)
export const matchInstanceQueryValidator = /* @__PURE__ */ getValidator(matchInstanceQuerySchema, queryValidator)
