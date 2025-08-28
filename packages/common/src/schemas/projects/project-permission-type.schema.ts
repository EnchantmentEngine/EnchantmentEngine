// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { querySyntax, Type } from '@feathersjs/typebox'

export const projectPermissionTypePath = 'project-permission-type'

// Main data model schema
export const projectPermissionTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'ProjectPermissionType', additionalProperties: false }
)
export interface ProjectPermissionTypeType extends Static<typeof projectPermissionTypeSchema> {}

// Schema for creating new entries
export const projectPermissionTypeDataSchema = Type.Pick(projectPermissionTypeSchema, ['type'], {
  $id: 'ProjectPermissionTypeData'
})
export interface ProjectPermissionTypeData extends Static<typeof projectPermissionTypeDataSchema> {}

// Schema for updating existing entries
export const projectPermissionTypePatchSchema = Type.Partial(projectPermissionTypeSchema, {
  $id: 'ProjectPermissionTypePatch'
})
export interface ProjectPermissionTypePatch extends Static<typeof projectPermissionTypePatchSchema> {}

// Schema for allowed query properties
export const projectPermissionTypeQueryProperties = Type.Pick(projectPermissionTypeSchema, ['type'])
export const projectPermissionTypeQuerySchema = Type.Intersect(
  [
    querySyntax(projectPermissionTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ProjectPermissionTypeQuery extends Static<typeof projectPermissionTypeQuerySchema> {}
