// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { UserID } from '@ir-engine/common/src/schema.type.module'

import { OpaqueType } from '../../interfaces/OpaqueType'
import { TypedString } from '../../types/TypeboxUtils'
import { staticResourceSchema } from '../media/static-resource.schema'
import { dataValidator, queryValidator } from '../validators'

export type AvatarID = OpaqueType<'AvatarID'> & string

export const avatarPath = 'avatar'

export const avatarMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const avatarSchema = Type.Object(
  {
    id: TypedString<AvatarID>({
      format: 'uuid'
    }),
    name: Type.String(),
    identifierName: Type.String(),
    modelResourceId: Type.String({
      format: 'uuid'
    }),
    thumbnailResourceId: Type.String({
      format: 'uuid'
    }),
    isPublic: Type.Boolean(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    project: Type.String(),
    user: Type.Optional(Type.Any()), // avoid circular reference to `userSchema` which utilizes current `avatarSchema`
    modelResource: Type.Optional(Type.Ref(staticResourceSchema)),
    thumbnailResource: Type.Optional(Type.Ref(staticResourceSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Avatar', additionalProperties: false }
)
export interface AvatarType extends Static<typeof avatarSchema> {}

export interface AvatarDatabaseType extends Omit<AvatarType, 'modelResource' | 'thumbnailResource'> {}

// Schema for creating new entries
// export const avatarDataSchema = Type.Pick(
//   avatarSchema,
//   ['name', 'identifierName', 'modelResourceId', 'thumbnailResourceId', 'isPublic', 'userId', 'project'],
//   {
//     $id: 'AvatarData'
//   }
// )
export const avatarDataSchema = Type.Partial(avatarSchema, {
  $id: 'AvatarData'
})
export interface AvatarData extends Static<typeof avatarDataSchema> {}

// Schema for updating existing entries
export const avatarPatchSchema = Type.Partial(avatarSchema, {
  $id: 'AvatarPatch'
})
export interface AvatarPatch extends Static<typeof avatarPatchSchema> {}

// Schema for allowed query properties
export const avatarQueryProperties = Type.Pick(avatarSchema, [
  'id',
  'name',
  'identifierName',
  'modelResourceId',
  'thumbnailResourceId',
  'isPublic',
  'userId',
  'project'
])
export const avatarQuerySchema = Type.Intersect(
  [
    querySyntax(avatarQueryProperties, {
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      { action: Type.Optional(Type.String()), skipUser: Type.Optional(Type.Boolean()) },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface AvatarQuery extends Static<typeof avatarQuerySchema> {}

export const avatarValidator = /* @__PURE__ */ getValidator(avatarSchema, dataValidator)
export const avatarDataValidator = /* @__PURE__ */ getValidator(avatarDataSchema, dataValidator)
export const avatarPatchValidator = /* @__PURE__ */ getValidator(avatarPatchSchema, dataValidator)
export const avatarQueryValidator = /* @__PURE__ */ getValidator(avatarQuerySchema, queryValidator)
