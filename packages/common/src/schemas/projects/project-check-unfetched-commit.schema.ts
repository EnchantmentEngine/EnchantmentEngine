// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const projectCheckUnfetchedCommitPath = 'project-check-unfetched-commit'

export const projectCheckUnfetchedCommitMethods = ['get'] as const

// Main data model schema
export const projectCheckUnfetchedCommitSchema = Type.Object(
  {
    error: Type.String(),
    text: Type.String(),
    projectName: Type.Optional(Type.String()),
    projectVersion: Type.Optional(Type.String()),
    engineVersion: Type.Optional(Type.String()),
    commitSHA: Type.Optional(Type.String()),
    datetime: Type.Optional(Type.String()),
    matchesEngineVersion: Type.Optional(Type.Boolean()),
    dependencies: Type.Optional(
      Type.Object({
        name: Type.String(),
        commit: Type.Optional(Type.String()),
        tag: Type.Optional(Type.String()),
        branch: Type.Optional(Type.String())
      })
    )
  },
  { $id: 'ProjectCheckUnfetchedCommit', additionalProperties: false }
)
export interface ProjectCheckUnfetchedCommitType extends Static<typeof projectCheckUnfetchedCommitSchema> {}

export const projectCheckUnfetchedCommitValidator = /* @__PURE__ */ getValidator(
  projectCheckUnfetchedCommitSchema,
  dataValidator
)
