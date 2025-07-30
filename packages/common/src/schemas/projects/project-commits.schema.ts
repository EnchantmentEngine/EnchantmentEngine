// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const projectCommitsPath = 'project-commits'

export const projectCommitsMethods = ['get'] as const

export const projectCommitSchema = Type.Object(
  {
    projectName: Type.String(),
    projectVersion: Type.String(),
    engineVersion: Type.String(),
    commitSHA: Type.String(),
    datetime: Type.String(),
    matchesEngineVersion: Type.Boolean(),
    discard: Type.Optional(Type.Boolean())
  },
  { $id: 'ProjectCommit', additionalProperties: false }
)
export interface ProjectCommitType extends Static<typeof projectCommitSchema> {}

// Main data model schema
export const projectCommitsSchema = Type.Object(
  {
    commits: Type.Union([
      Type.Array(Type.Ref(projectCommitSchema)),
      Type.Object({
        error: Type.String(),
        text: Type.String()
      })
    ])
  },
  { $id: 'ProjectCommits', additionalProperties: false }
)
export interface ProjectCommitsType extends Static<typeof projectCommitsSchema> {}

export const projectCommitValidator = /* @__PURE__ */ getValidator(projectCommitSchema, dataValidator)
export const projectCommitsValidator = /* @__PURE__ */ getValidator(projectCommitsSchema, dataValidator)
