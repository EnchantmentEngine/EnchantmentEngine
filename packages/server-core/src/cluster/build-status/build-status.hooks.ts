import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  buildStatusDataValidator,
  buildStatusPatchValidator,
  buildStatusQueryValidator
} from '@ir-engine/common/src/schemas/cluster/build-status.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  buildStatusDataResolver,
  buildStatusExternalResolver,
  buildStatusPatchResolver,
  buildStatusQueryResolver,
  buildStatusResolver
} from './build-status.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(buildStatusExternalResolver), schemaHooks.resolveResult(buildStatusResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(buildStatusQueryValidator), schemaHooks.resolveQuery(buildStatusQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external'), verifyScope('server', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusDataValidator),
      schemaHooks.resolveData(buildStatusDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusPatchValidator),
      schemaHooks.resolveData(buildStatusPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('server', 'read'))]
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
