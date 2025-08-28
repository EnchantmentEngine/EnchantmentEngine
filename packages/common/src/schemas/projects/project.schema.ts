// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { projectSettingSchema } from '../setting/project-setting.schema'
import { UserID, UserType } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { projectPermissionSchema } from './project-permission.schema'

export const projectPath = 'project'

export const projectMethods = ['get', 'find', 'create', 'patch', 'remove', 'update'] as const

export const projectUpdateTypes = ['none', 'commit', 'tag']

// Main data model schema
export const projectSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    enabled: Type.Boolean(),
    thumbnail: Type.Optional(Type.String()),
    repositoryPath: Type.String(),
    version: Type.Optional(Type.String()),
    engineVersion: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    needsRebuild: Type.Boolean(),
    hasLocalChanges: Type.Boolean(),
    sourceRepo: Type.Optional(Type.String()),
    sourceBranch: Type.Optional(Type.String()),
    updateType: Type.Optional(StringEnum(projectUpdateTypes)),
    updateSchedule: Type.Optional(Type.String()),
    updateUserId: Type.Optional(Type.String()),
    hasWriteAccess: Type.Optional(Type.Boolean()),
    projectPermissions: Type.Optional(Type.Array(Type.Ref(projectPermissionSchema))),
    commitSHA: Type.Optional(Type.String()),
    commitDate: Type.Optional(Type.String({ format: 'date-time' })),
    assetsOnly: Type.Boolean(),
    visibility: StringEnum(['private', 'public']),
    settings: Type.Optional(Type.Array(Type.Ref(projectSettingSchema))),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Project', additionalProperties: false }
)
export interface ProjectType extends Static<typeof projectSchema> {}

export interface ProjectDatabaseType extends Omit<ProjectType, 'settings'> {}

// Schema for creating new entries
export const projectDataSchema = Type.Partial(projectSchema, {
  $id: 'ProjectData'
})
export interface ProjectData extends Static<typeof projectDataSchema> {}

// Schema for updating existing entries
export const projectPatchSchema = Type.Partial(projectSchema, {
  $id: 'ProjectPatch'
})
export interface ProjectPatch extends Static<typeof projectPatchSchema> {}

// Schema for allowed query properties
export const projectQueryProperties = Type.Pick(projectSchema, [
  'id',
  'name',
  'enabled',
  'thumbnail',
  'repositoryPath',
  'version',
  'engineVersion',
  'description',
  'needsRebuild',
  'hasLocalChanges',
  'sourceRepo',
  'sourceBranch',
  'updateType',
  'updateSchedule',
  'updateUserId',
  'hasWriteAccess',
  'visibility',
  'commitSHA',
  'commitDate'
])
export const projectQuerySchema = Type.Intersect(
  [
    querySyntax(projectQueryProperties, {
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        assetsOnly: Type.Optional(Type.Boolean()),
        action: Type.Optional(Type.String()),
        sourceURL: Type.Optional(Type.String()),
        destinationURL: Type.Optional(Type.String()),
        existingProject: Type.Optional(Type.Boolean()),
        inputProjectURL: Type.Optional(Type.String()),
        returnJob: Type.Optional(Type.Boolean()),
        selectedSHA: Type.Optional(Type.String()),
        allowed: Type.Optional(Type.Boolean()),
        reset: Type.Optional(Type.Boolean()),
        populateProjectPermissions: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  // Add additional query properties here
  { additionalProperties: false }
)
export interface ProjectQuery extends Static<typeof projectQuerySchema> {}

export const projectValidator = /* @__PURE__ */ getValidator(projectSchema, dataValidator)
export const projectDataValidator = /* @__PURE__ */ getValidator(projectDataSchema, dataValidator)
export const projectPatchValidator = /* @__PURE__ */ getValidator(projectPatchSchema, dataValidator)
export const projectQueryValidator = /* @__PURE__ */ getValidator(projectQuerySchema, queryValidator)

export type ProjectUpdateParams = {
  user?: UserType
  isJob?: boolean
  jobId?: string
  populateProjectPermissions?: boolean
}
