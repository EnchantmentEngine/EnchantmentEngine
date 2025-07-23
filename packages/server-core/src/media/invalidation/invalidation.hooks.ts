import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  invalidationDataValidator,
  invalidationQueryValidator
} from '@ir-engine/common/src/schemas/media/invalidation.schema'

import {
  invalidationDataResolver,
  invalidationExternalResolver,
  invalidationQueryResolver,
  invalidationResolver
} from './invalidation.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(invalidationExternalResolver), schemaHooks.resolveResult(invalidationResolver)]
  },

  before: {
    all: [
      disallow('external'),
      schemaHooks.validateQuery(invalidationQueryValidator),
      schemaHooks.resolveQuery(invalidationQueryResolver)
    ],
    find: [],
    get: [],
    create: [schemaHooks.validateData(invalidationDataValidator), schemaHooks.resolveData(invalidationDataResolver)],
    update: [disallow()],
    patch: [disallow()],
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
