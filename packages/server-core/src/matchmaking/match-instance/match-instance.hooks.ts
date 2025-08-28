import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  matchInstanceDataValidator,
  matchInstancePatchValidator,
  matchInstanceQueryValidator
} from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'

import createInstance from '../../hooks/matchmaking-create-instance'
import {
  matchInstanceDataResolver,
  matchInstanceExternalResolver,
  matchInstancePatchResolver,
  matchInstanceQueryResolver,
  matchInstanceResolver
} from './match-instance.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchInstanceExternalResolver), schemaHooks.resolveResult(matchInstanceResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(matchInstanceQueryValidator), schemaHooks.resolveQuery(matchInstanceQueryResolver)],
    find: [],
    get: [iff(isProvider('external'), setLoggedInUser('userId'))],
    create: [
      iff(isProvider('external'), disallow()),
      schemaHooks.validateData(matchInstanceDataValidator),
      schemaHooks.resolveData(matchInstanceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), disallow()),
      schemaHooks.validateData(matchInstancePatchValidator),
      schemaHooks.resolveData(matchInstancePatchResolver)
    ],
    remove: [iff(isProvider('external'), disallow())]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createInstance()],
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
