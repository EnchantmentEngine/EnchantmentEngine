import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import checkScope from '../../hooks/check-scope'
import or from '../../hooks/or'
import { builderInfoExternalResolver, builderInfoResolver } from './builder-info.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(builderInfoExternalResolver), schemaHooks.resolveResult(builderInfoResolver)]
  },

  before: {
    all: [],
    find: [disallow()],
    get: [
      iff(
        isProvider('external'),
        iff(or(checkScope('projects', 'read'), checkScope('editor', 'write'))).else(disallow())
      )
    ],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
