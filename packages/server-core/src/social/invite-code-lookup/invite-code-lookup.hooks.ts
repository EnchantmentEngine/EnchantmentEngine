import { hooks as schemaHooks } from '@feathersjs/schema'

import { inviteCodeLookupQueryValidator } from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'

import {
  inviteCodeLookupExternalResolver,
  inviteCodeLookupQueryResolver,
  inviteCodeLookupResolver
} from './invite-code-lookup.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(inviteCodeLookupExternalResolver),
      schemaHooks.resolveResult(inviteCodeLookupResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(inviteCodeLookupQueryValidator),
      schemaHooks.resolveQuery(inviteCodeLookupQueryResolver)
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
