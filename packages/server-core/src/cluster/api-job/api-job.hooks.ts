import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  apiJobDataValidator,
  apiJobPatchValidator,
  apiJobQueryValidator
} from '@ir-engine/common/src/schemas/cluster/api-job.schema'

import { isSignedByAppJWT } from '../../hooks/is-signed-by-app-jwt'
import verifyScope from '../../hooks/verify-scope'
import {
  apiJobDataResolver,
  apiJobExternalResolver,
  apiJobPatchResolver,
  apiJobQueryResolver,
  apiJobResolver
} from './api-job.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(apiJobExternalResolver), schemaHooks.resolveResult(apiJobResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(apiJobQueryValidator), schemaHooks.resolveQuery(apiJobQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external') && !isSignedByAppJWT(), verifyScope('server', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(apiJobDataValidator),
      schemaHooks.resolveData(apiJobDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(apiJobPatchValidator),
      schemaHooks.resolveData(apiJobPatchResolver)
    ],
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
