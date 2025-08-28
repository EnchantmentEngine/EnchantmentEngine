import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { botCommandDataValidator, botCommandQueryValidator } from '@ir-engine/common/src/schemas/bot/bot-command.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  botCommandDataResolver,
  botCommandExternalResolver,
  botCommandQueryResolver,
  botCommandResolver
} from './bot-command.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(botCommandExternalResolver), schemaHooks.resolveResult(botCommandResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(botCommandQueryValidator), schemaHooks.resolveQuery(botCommandQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    get: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('bot', 'write')),
      schemaHooks.validateData(botCommandDataValidator),
      schemaHooks.resolveData(botCommandDataResolver)
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'), verifyScope('bot', 'write'))]
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
