// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const staticResourcePath = 'static-resource'

export const staticResourceMethods = ['get', 'find', 'create', 'update', 'patch', 'remove'] as const

// Main data model schema
export const staticResourceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    mimeType: Type.String(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    user: Type.Optional(Type.Ref(userSchema)),
    hash: Type.String(),
    type: Type.String(), // 'scene' | 'asset' | 'file' | 'thumbnail' | 'avatar' | 'recording'
    project: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    dependencies: Type.Optional(Type.Array(Type.String())),
    attribution: Type.Optional(Type.String()),
    licensing: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    url: Type.String(),
    stats: Type.Optional(Type.Record(Type.String(), Type.Any())),
    thumbnailKey: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    thumbnailURL: Type.Optional(Type.String()),
    thumbnailMode: Type.Optional(Type.Union([Type.String(), Type.Null()])), // 'automatic' | 'manual'
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    width: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    height: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    depth: Type.Optional(Type.Union([Type.Number(), Type.Null()]))
  },
  { $id: 'StaticResource', additionalProperties: false }
)
export interface StaticResourceType extends Static<typeof staticResourceSchema> {}

export interface StaticResourceDatabaseType
  extends Omit<StaticResourceType, 'url' | 'dependencies' | 'tags' | 'stats' | 'thumbnailURL'> {
  dependencies: string
  tags: string
  stats: string
}

// Schema for creating new entries
export const staticResourceDataSchema = Type.Partial(
  Type.Pick(staticResourceSchema, [
    'id',
    'key',
    'mimeType',
    'userId',
    'hash',
    'type',
    'project',
    'tags',
    'dependencies',
    'attribution',
    'licensing',
    'description',
    'stats',
    'thumbnailKey',
    'thumbnailMode',
    'name',
    'width',
    'height',
    'depth'
  ]),
  { $id: 'StaticResourceData' }
)
export interface StaticResourceData extends Static<typeof staticResourceDataSchema> {}

// Schema for updating existing entries
export const staticResourcePatchSchema = Type.Partial(
  Type.Pick(staticResourceSchema, [
    'id',
    'key',
    'mimeType',
    'userId',
    'hash',
    'type',
    'project',
    'tags',
    'dependencies',
    'attribution',
    'licensing',
    'description',
    'stats',
    'thumbnailKey',
    'thumbnailMode',
    'name',
    'width',
    'height',
    'depth'
  ]),
  {
    $id: 'StaticResourcePatch'
  }
)
export interface StaticResourcePatch extends Static<typeof staticResourcePatchSchema> {}

// Schema for allowed query properties
export const staticResourceQueryProperties = Type.Pick(staticResourceSchema, [
  'id',
  'key',
  'mimeType',
  'userId',
  'hash',
  'type',
  'project',
  'tags',
  'dependencies',
  'attribution',
  'licensing',
  'description',
  'stats',
  'thumbnailKey',
  'thumbnailMode',
  'createdAt',
  'updatedAt',
  'name',
  'width',
  'height',
  'depth'
])
export const staticResourceQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceQueryProperties, {
      key: {
        $like: Type.String()
      },
      mimeType: {
        $like: Type.String()
      },
      tags: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface StaticResourceQuery extends Static<typeof staticResourceQuerySchema> {}

export const staticResourceValidator = /* @__PURE__ */ getValidator(staticResourceSchema, dataValidator)
export const staticResourceDataValidator = /* @__PURE__ */ getValidator(staticResourceDataSchema, dataValidator)
export const staticResourcePatchValidator = /* @__PURE__ */ getValidator(staticResourcePatchSchema, dataValidator)
export const staticResourceQueryValidator = /* @__PURE__ */ getValidator(staticResourceQuerySchema, queryValidator)
