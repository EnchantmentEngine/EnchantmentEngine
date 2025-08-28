import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { scopeTypeDataValidator, scopeTypeQueryValidator } from '@ir-engine/common/src/schemas/scope/scope-type.schema'

import enableClientPagination from '../../hooks/enable-client-pagination'
import {
  scopeTypeDataResolver,
  scopeTypeExternalResolver,
  scopeTypeQueryResolver,
  scopeTypeResolver
} from './scope-type.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(scopeTypeExternalResolver), schemaHooks.resolveResult(scopeTypeResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(scopeTypeQueryValidator), schemaHooks.resolveQuery(scopeTypeQueryResolver)],
    find: [iff(isProvider('external'), enableClientPagination())],
    get: [],
    create: [
      disallow('external'),
      schemaHooks.validateData(scopeTypeDataValidator),
      schemaHooks.resolveData(scopeTypeDataResolver)
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow('external')]
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
