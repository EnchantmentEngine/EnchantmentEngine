// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const scopePath = 'scope'

export const scopeMethods = ['create', 'find', 'remove'] as const
export type ScopeType = OpaqueType<'ScopeType'> & string

export type ScopeID = OpaqueType<'ScopeID'> & string

// Main data model schema
export const scopeSchema = Type.Object(
  {
    id: TypedString<ScopeID>({
      format: 'uuid'
    }),
    type: TypedString<ScopeType>(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Scope', additionalProperties: false }
)
export interface ScopeTypeInterface extends Static<typeof scopeSchema> {}

// Schema for creating new entries
export const scopeDataSchema = Type.Pick(scopeSchema, ['type', 'userId'], {
  $id: 'ScopeData'
})
export interface ScopeData extends Static<typeof scopeDataSchema> {}

// Schema for updating existing entries
export const scopePatchSchema = Type.Object(
  {
    scopes: Type.Array(TypedString<ScopeType>()),
    userId: TypedString<UserID>({
      format: 'uuid'
    })
  },
  {
    $id: 'ScopePatch'
  }
)
export interface ScopePatch extends Static<typeof scopePatchSchema> {}

// Schema for allowed query properties
export const scopeQueryProperties = Type.Pick(scopeSchema, ['id', 'type', 'userId'])
export const scopeQuerySchema = Type.Intersect(
  [
    querySyntax(scopeQueryProperties),
    // Add additional query properties here
    Type.Object({ paginate: Type.Optional(Type.Boolean()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ScopeQuery extends Static<typeof scopeQuerySchema> {}

export const scopeValidator = /* @__PURE__ */ getValidator(scopeSchema, dataValidator)
export const scopeDataValidator = /* @__PURE__ */ getValidator(scopeDataSchema, dataValidator)
export const scopePatchValidator = /* @__PURE__ */ getValidator(scopePatchSchema, dataValidator)
export const scopeQueryValidator = /* @__PURE__ */ getValidator(scopeQuerySchema, queryValidator)
