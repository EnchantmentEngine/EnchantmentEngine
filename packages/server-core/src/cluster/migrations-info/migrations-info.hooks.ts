import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { migrationsInfoQueryValidator } from '@ir-engine/common/src/schemas/cluster/migrations-info.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  migrationsInfoExternalResolver,
  migrationsInfoQueryResolver,
  migrationsInfoResolver
} from './migrations-info.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(migrationsInfoExternalResolver),
      schemaHooks.resolveResult(migrationsInfoResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(migrationsInfoQueryValidator),
      schemaHooks.resolveQuery(migrationsInfoQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [disallow()],
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
