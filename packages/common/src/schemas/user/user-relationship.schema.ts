// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { userRelationshipTypes } from './user-relationship-type.schema'
import { UserID, userSchema } from './user.schema'

export const userRelationshipPath = 'user-relationship'

export const userRelationshipMethods = ['find', 'create', 'patch', 'remove'] as const

export type UserRelationshipID = OpaqueType<'UserRelationshipID'> & string

// Main data model schema
export const userRelationshipSchema = Type.Object(
  {
    id: TypedString<UserRelationshipID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>(),
    relatedUserId: TypedString<UserID>({
      format: 'uuid'
    }),
    user: Type.Ref(userSchema),
    relatedUser: Type.Ref(userSchema),
    userRelationshipType: StringEnum(userRelationshipTypes),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserRelationship', additionalProperties: false }
)
export interface UserRelationshipType extends Static<typeof userRelationshipSchema> {}

// Schema for creating new entries
export const userRelationshipDataSchema = Type.Pick(
  userRelationshipSchema,
  ['userId', 'relatedUserId', 'userRelationshipType'],
  {
    $id: 'UserRelationshipData'
  }
)
export interface UserRelationshipData extends Static<typeof userRelationshipDataSchema> {}

// Schema for updating existing entries
export const userRelationshipPatchSchema = Type.Partial(userRelationshipSchema, {
  $id: 'UserRelationshipPatch'
})
export interface UserRelationshipPatch extends Static<typeof userRelationshipPatchSchema> {}

// Schema for allowed query properties
export const userRelationshipQueryProperties = Type.Pick(userRelationshipSchema, [
  'userId',
  'relatedUserId',
  'userRelationshipType'
])
export const userRelationshipQuerySchema = Type.Intersect(
  [
    querySyntax(userRelationshipQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserRelationshipQuery extends Static<typeof userRelationshipQuerySchema> {}

export const userRelationshipValidator = /* @__PURE__ */ getValidator(userRelationshipSchema, dataValidator)
export const userRelationshipDataValidator = /* @__PURE__ */ getValidator(userRelationshipDataSchema, dataValidator)
export const userRelationshipPatchValidator = /* @__PURE__ */ getValidator(userRelationshipPatchSchema, dataValidator)
export const userRelationshipQueryValidator = /* @__PURE__ */ getValidator(userRelationshipQuerySchema, queryValidator)
