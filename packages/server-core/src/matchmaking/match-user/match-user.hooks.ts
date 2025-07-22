import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  matchUserDataValidator,
  matchUserPatchValidator,
  matchUserQueryValidator
} from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import setLoggedInUserInQuery from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-query'

import {
  matchUserDataResolver,
  matchUserExternalResolver,
  matchUserPatchResolver,
  matchUserQueryResolver,
  matchUserResolver
} from './match-user.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchUserExternalResolver), schemaHooks.resolveResult(matchUserResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(matchUserQueryValidator), schemaHooks.resolveQuery(matchUserQueryResolver)],
    find: [iff(isProvider('external'), setLoggedInUserInQuery('userId') as any)],
    get: [],
    create: [
      iff(isProvider('external'), setLoggedInUser('userId') as any),
      schemaHooks.validateData(matchUserDataValidator),
      schemaHooks.resolveData(matchUserDataResolver)
    ],
    update: [],
    patch: [schemaHooks.validateData(matchUserPatchValidator), schemaHooks.resolveData(matchUserPatchResolver)],
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
