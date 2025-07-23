// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, StringEnum, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'
import { projectUpdateTypes } from './project.schema'

export const projectBuildPath = 'project-build'

export const projectBuildMethods = ['find', 'patch'] as const

export const ProjectBuildUpdateItemSchema = Type.Object(
  {
    sourceURL: Type.String(),
    destinationURL: Type.String(),
    name: Type.String(),
    needsRebuild: Type.Optional(Type.Boolean()),
    reset: Type.Optional(Type.Boolean()),
    commitSHA: Type.String(),
    sourceBranch: Type.String(),
    updateType: StringEnum(projectUpdateTypes),
    updateSchedule: Type.String(),
    token: Type.Optional(Type.Boolean())
  },
  { $id: 'ProjectUpdate', additionalProperties: false }
)
export interface ProjectBuildUpdateItemType extends Static<typeof ProjectBuildUpdateItemSchema> {}

// Main data model schema
export const projectBuildSchema = Type.Object(
  {
    failed: Type.Boolean(),
    succeeded: Type.Boolean()
  },
  { $id: 'ProjectBuild', additionalProperties: false }
)
export interface ProjectBuildType extends Static<typeof projectBuildSchema> {}

// Schema for updating existing entries
export const projectBuildPatchSchema = Type.Object(
  {
    updateProjects: Type.Optional(Type.Boolean()),
    projectsToUpdate: Type.Optional(Type.Array(Type.Ref(ProjectBuildUpdateItemSchema)))
  },
  {
    $id: 'ProjectBuildPatch'
  }
)

export interface ProjectBuildPatch extends Static<typeof projectBuildPatchSchema> {}

export const projectUpdateValidator = /* @__PURE__ */ getValidator(ProjectBuildUpdateItemSchema, dataValidator)
export const projectBuildValidator = /* @__PURE__ */ getValidator(projectBuildSchema, dataValidator)
export const projectBuildPatchValidator = /* @__PURE__ */ getValidator(projectBuildPatchSchema, dataValidator)
