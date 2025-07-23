import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  instanceAuthorizedUserDataValidator,
  instanceAuthorizedUserPatchValidator,
  instanceAuthorizedUserQueryValidator
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

import {
  instanceAuthorizedUserDataResolver,
  instanceAuthorizedUserExternalResolver,
  instanceAuthorizedUserPatchResolver,
  instanceAuthorizedUserQueryResolver,
  instanceAuthorizedUserResolver
} from './instance-authorized-user.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(instanceAuthorizedUserExternalResolver),
      schemaHooks.resolveResult(instanceAuthorizedUserResolver)
    ]
  },

  before: {
    all: [
      disallow('external'),
      schemaHooks.validateQuery(instanceAuthorizedUserQueryValidator),
      schemaHooks.resolveQuery(instanceAuthorizedUserQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      schemaHooks.validateData(instanceAuthorizedUserDataValidator),
      schemaHooks.resolveData(instanceAuthorizedUserDataResolver)
    ],
    update: [],
    patch: [
      schemaHooks.validateData(instanceAuthorizedUserPatchValidator),
      schemaHooks.resolveData(instanceAuthorizedUserPatchResolver)
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
