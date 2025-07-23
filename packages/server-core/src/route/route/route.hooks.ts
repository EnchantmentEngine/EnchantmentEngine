import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  routeDataValidator,
  routePatchValidator,
  routeQueryValidator
} from '@ir-engine/common/src/schemas/route/route.schema'

import enableClientPagination from '../../hooks/enable-client-pagination'
import verifyScope from '../../hooks/verify-scope'
import {
  routeDataResolver,
  routeExternalResolver,
  routePatchResolver,
  routeQueryResolver,
  routeResolver
} from './route.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(routeExternalResolver), schemaHooks.resolveResult(routeResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(routeQueryValidator), schemaHooks.resolveQuery(routeQueryResolver)],
    find: [enableClientPagination()],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateData(routeDataValidator),
      schemaHooks.resolveData(routeDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateData(routePatchValidator),
      schemaHooks.resolveData(routePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'))]
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
