import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  githubRepoAccessDataValidator,
  githubRepoAccessPatchValidator,
  githubRepoAccessQueryValidator
} from '@ir-engine/common/src/schemas/user/github-repo-access.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  githubRepoAccessDataResolver,
  githubRepoAccessExternalResolver,
  githubRepoAccessPatchResolver,
  githubRepoAccessQueryResolver,
  githubRepoAccessResolver
} from './github-repo-access.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(githubRepoAccessExternalResolver),
      schemaHooks.resolveResult(githubRepoAccessResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(githubRepoAccessQueryValidator),
      schemaHooks.resolveQuery(githubRepoAccessQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('projects', 'read'))],
    get: [iff(isProvider('external'), verifyScope('projects', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('projects', 'write')),
      schemaHooks.validateData(githubRepoAccessDataValidator),
      schemaHooks.resolveData(githubRepoAccessDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('projects', 'write')),
      schemaHooks.validateData(githubRepoAccessPatchValidator),
      schemaHooks.resolveData(githubRepoAccessPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('projects', 'write'))]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
