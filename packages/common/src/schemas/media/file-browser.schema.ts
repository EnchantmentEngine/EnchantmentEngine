import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'
import { staticResourceSchema } from './static-resource.schema'

export const fileBrowserPath = 'file-browser'
export const fileBrowserMethods = ['create', 'find', 'get', 'patch', 'remove', 'update'] as const

export const fileBrowserContentSchema = Type.Object(
  {
    key: Type.String(),
    type: Type.String(),
    name: Type.String(),
    url: Type.String(),
    thumbnailURL: Type.Optional(Type.String()),
    size: Type.Optional(Type.Number())
  },
  {
    $id: 'FileBrowserContent'
  }
)
export interface FileBrowserContentType extends Static<typeof fileBrowserContentSchema> {}

export const fileBrowserUpdateSchema = Type.Object(
  {
    oldProject: Type.String(),
    newProject: Type.String(),
    oldName: Type.String(),
    newName: Type.String(),
    oldPath: Type.String(),
    newPath: Type.String(),
    isCopy: Type.Optional(Type.Boolean()),
    storageProviderName: Type.Optional(Type.String())
  },
  {
    $id: 'FileBrowserUpdate'
  }
)
export interface FileBrowserUpdate extends Static<typeof fileBrowserUpdateSchema> {}

export const fileBrowserPatchSchema = Type.Intersect(
  [
    Type.Partial(
      Type.Pick(staticResourceSchema, [
        'type',
        'tags',
        'dependencies',
        'attribution',
        'licensing',
        'description',
        'thumbnailKey',
        'thumbnailMode'
      ])
    ),
    Type.Object({
      path: Type.String(),
      unique: Type.Optional(Type.Boolean()),
      project: Type.String(),
      body: Type.Any(), // Buffer | string
      contentType: Type.Optional(Type.String()),
      storageProviderName: Type.Optional(Type.String()),
      fileName: Type.Optional(Type.String())
    })
  ],
  {
    additionalProperties: false,
    $id: 'FileBrowserPatch'
  }
)
export interface FileBrowserPatch extends Static<typeof fileBrowserPatchSchema> {}

export const fileBrowserContentValidator = /* @__PURE__ */ getValidator(fileBrowserContentSchema, dataValidator)
export const fileBrowserUpdateValidator = /* @__PURE__ */ getValidator(fileBrowserUpdateSchema, dataValidator)
export const fileBrowserPatchValidator = /* @__PURE__ */ getValidator(fileBrowserPatchSchema, dataValidator)
