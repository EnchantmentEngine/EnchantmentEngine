import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'
import {
  projectCheckUnfetchedCommitExternalResolver,
  projectCheckUnfetchedCommitResolver
} from './project-check-unfetched-commit.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectCheckUnfetchedCommitExternalResolver),
      schemaHooks.resolveResult(projectCheckUnfetchedCommitResolver)
    ]
  },

  before: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), verifyScope('projects', 'read'))],
    create: [],
    update: [],
    patch: [],
    remove: []
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
