import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  locationAuthorizedUserDataValidator,
  locationAuthorizedUserPatchValidator,
  locationAuthorizedUserQueryValidator
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'
import attachOwnerIdInQuery from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-query'

import {
  locationAuthorizedUserDataResolver,
  locationAuthorizedUserExternalResolver,
  locationAuthorizedUserPatchResolver,
  locationAuthorizedUserQueryResolver,
  locationAuthorizedUserResolver
} from './location-authorized-user.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(locationAuthorizedUserExternalResolver),
      schemaHooks.resolveResult(locationAuthorizedUserResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(locationAuthorizedUserQueryValidator),
      schemaHooks.resolveQuery(locationAuthorizedUserQueryResolver)
    ],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      disallow('external'),
      schemaHooks.validateData(locationAuthorizedUserDataValidator),
      schemaHooks.resolveData(locationAuthorizedUserDataResolver)
    ],
    update: [disallow('external')],
    patch: [
      disallow('external'),
      schemaHooks.validateData(locationAuthorizedUserPatchValidator),
      schemaHooks.resolveData(locationAuthorizedUserPatchResolver)
    ],
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
