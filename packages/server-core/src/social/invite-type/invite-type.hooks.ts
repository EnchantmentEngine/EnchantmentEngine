import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  inviteTypeDataValidator,
  inviteTypePatchValidator,
  inviteTypeQueryValidator
} from '@ir-engine/common/src/schemas/social/invite-type.schema'

import {
  inviteTypeDataResolver,
  inviteTypeExternalResolver,
  inviteTypePatchResolver,
  inviteTypeQueryResolver,
  inviteTypeResolver
} from './invite-type.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(inviteTypeExternalResolver), schemaHooks.resolveResult(inviteTypeResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(inviteTypeQueryValidator), schemaHooks.resolveQuery(inviteTypeQueryResolver)],
    find: [],
    get: [],
    create: [
      disallow('external'),
      schemaHooks.validateData(inviteTypeDataValidator),
      schemaHooks.resolveData(inviteTypeDataResolver)
    ],
    update: [disallow()],
    patch: [
      disallow(),
      schemaHooks.validateData(inviteTypePatchValidator),
      schemaHooks.resolveData(inviteTypePatchResolver)
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
