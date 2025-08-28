import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  moderationAttachmentDataValidator,
  moderationAttachmentPatchValidator,
  moderationAttachmentQueryValidator
} from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { iff, isProvider } from 'feathers-hooks-common'
import {
  moderationAttachmentDataResolver,
  moderationAttachmentExternalResolver,
  moderationAttachmentPatchResolver,
  moderationAttachmentQueryResolver,
  moderationAttachmentResolver
} from './moderation-attachment.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(moderationAttachmentExternalResolver),
      schemaHooks.resolveResult(moderationAttachmentResolver)
    ]
  },
  before: {
    all: [
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    find: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    get: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    create: [
      schemaHooks.validateData(moderationAttachmentDataValidator),
      schemaHooks.resolveData(moderationAttachmentDataResolver)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationAttachmentPatchValidator),
      schemaHooks.resolveData(moderationAttachmentPatchResolver)
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
