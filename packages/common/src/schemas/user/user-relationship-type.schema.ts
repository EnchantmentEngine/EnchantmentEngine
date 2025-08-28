// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const userRelationshipTypePath = 'user-relationship-type'

export const userRelationshipTypeMethods = ['find'] as const

export const userRelationshipTypes = [
  'requested', // Default state of relatedUser. Friend request send to another user
  'pending', // Friend request pending by other user
  'friend',
  'blocking', // Blocking another user
  'blocked' // Blocked by other user
]

// Main data model schema
export const userRelationshipTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'UserRelationshipType', additionalProperties: false }
)
export interface UserRelationshipTypeType extends Static<typeof userRelationshipTypeSchema> {}

// Schema for creating new entries
export const userRelationshipTypeDataSchema = Type.Pick(userRelationshipTypeSchema, ['type'], {
  $id: 'UserRelationshipTypeData'
})
export interface UserRelationshipTypeData extends Static<typeof userRelationshipTypeDataSchema> {}

// Schema for updating existing entries
export const userRelationshipTypePatchSchema = Type.Partial(userRelationshipTypeSchema, {
  $id: 'UserRelationshipTypePatch'
})
export interface UserRelationshipTypePatch extends Static<typeof userRelationshipTypePatchSchema> {}

// Schema for allowed query properties
export const userRelationshipTypeQueryProperties = Type.Pick(userRelationshipTypeSchema, ['type'])
export const userRelationshipTypeQuerySchema = Type.Intersect(
  [
    querySyntax(userRelationshipTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserRelationshipTypeQuery extends Static<typeof userRelationshipTypeQuerySchema> {}

export const userRelationshipTypeValidator = /* @__PURE__ */ getValidator(userRelationshipTypeSchema, dataValidator)
export const userRelationshipTypeDataValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypeDataSchema,
  dataValidator
)
export const userRelationshipTypePatchValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypePatchSchema,
  dataValidator
)
export const userRelationshipTypeQueryValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypeQuerySchema,
  queryValidator
)
