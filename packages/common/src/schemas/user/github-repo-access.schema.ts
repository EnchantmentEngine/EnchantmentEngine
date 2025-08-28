// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const githubRepoAccessPath = 'github-repo-access'

export const githubRepoAccessMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const githubRepoAccessSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    repo: Type.String(),
    hasWriteAccess: Type.Boolean(),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'GithubRepoAccess', additionalProperties: false }
)
export interface GithubRepoAccessType extends Static<typeof githubRepoAccessSchema> {}

// Schema for creating new entries
export const githubRepoAccessDataSchema = Type.Pick(
  githubRepoAccessSchema,
  ['repo', 'hasWriteAccess', 'identityProviderId'],
  {
    $id: 'GithubRepoAccessData'
  }
)
export interface GithubRepoAccessData extends Static<typeof githubRepoAccessDataSchema> {}

// Schema for updating existing entries
export const githubRepoAccessPatchSchema = Type.Partial(githubRepoAccessSchema, {
  $id: 'GithubRepoAccessPatch'
})
export interface GithubRepoAccessPatch extends Static<typeof githubRepoAccessPatchSchema> {}

// Schema for allowed query properties
export const githubRepoAccessQueryProperties = Type.Pick(githubRepoAccessSchema, [
  'id',
  'repo',
  'hasWriteAccess',
  'identityProviderId'
])
export const githubRepoAccessQuerySchema = Type.Intersect(
  [
    querySyntax(githubRepoAccessQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface GithubRepoAccessQuery extends Static<typeof githubRepoAccessQuerySchema> {}

export const githubRepoAccessValidator = /* @__PURE__ */ getValidator(githubRepoAccessSchema, dataValidator)
export const githubRepoAccessDataValidator = /* @__PURE__ */ getValidator(githubRepoAccessDataSchema, dataValidator)
export const githubRepoAccessPatchValidator = /* @__PURE__ */ getValidator(githubRepoAccessPatchSchema, dataValidator)
export const githubRepoAccessQueryValidator = /* @__PURE__ */ getValidator(githubRepoAccessQuerySchema, queryValidator)
