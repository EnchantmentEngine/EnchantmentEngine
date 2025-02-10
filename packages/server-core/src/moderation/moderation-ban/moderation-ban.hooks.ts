import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  moderationBanDataValidator,
  moderationBanPatchValidator,
  moderationBanQueryValidator
} from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'
import {
  moderationBanDataResolver,
  moderationBanExternalResolver,
  moderationBanPatchResolver,
  moderationBanQueryResolver,
  moderationBanResolver
} from './moderation-ban.resolvers'

import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { iff, isProvider } from 'feathers-hooks-common'

export default {
  around: {
    all: [schemaHooks.resolveExternal(moderationBanExternalResolver), schemaHooks.resolveResult(moderationBanResolver)]
  },
  before: {
    all: [schemaHooks.validateQuery(moderationBanQueryValidator), schemaHooks.resolveQuery(moderationBanQueryResolver)],
    find: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationBanQueryValidator),
      schemaHooks.resolveQuery(moderationBanQueryResolver)
    ],
    get: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationBanQueryValidator),
      schemaHooks.resolveQuery(moderationBanQueryResolver)
    ],
    create: [schemaHooks.validateData(moderationBanDataValidator), schemaHooks.resolveData(moderationBanDataResolver)],
    patch: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationBanPatchValidator),
      schemaHooks.resolveData(moderationBanPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('moderation', 'write'))]
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
    all: []
  }
} as any
