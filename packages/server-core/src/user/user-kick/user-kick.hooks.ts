import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  userKickDataValidator,
  userKickPatchValidator,
  userKickQueryValidator
} from '@ir-engine/common/src/schemas/user/user-kick.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  userKickDataResolver,
  userKickExternalResolver,
  userKickPatchResolver,
  userKickQueryResolver,
  userKickResolver
} from './user-kick.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(userKickExternalResolver), schemaHooks.resolveResult(userKickResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userKickQueryValidator), schemaHooks.resolveQuery(userKickQueryResolver)],
    find: [],
    get: [disallow()],
    create: [schemaHooks.validateData(userKickDataValidator), schemaHooks.resolveData(userKickDataResolver)],
    update: [],
    patch: [schemaHooks.validateData(userKickPatchValidator), schemaHooks.resolveData(userKickPatchResolver)],
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
