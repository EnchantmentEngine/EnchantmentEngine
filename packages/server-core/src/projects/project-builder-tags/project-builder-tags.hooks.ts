import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'
import { projectBuilderTagsExternalResolver, projectBuilderTagsResolver } from './project-builder-tags.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectBuilderTagsExternalResolver),
      schemaHooks.resolveResult(projectBuilderTagsResolver)
    ]
  },

  before: {
    all: [],
    find: [iff(isProvider('external'), verifyScope('projects', 'read'))],
    get: [],
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
