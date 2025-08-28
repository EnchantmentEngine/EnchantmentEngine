import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  recordingResourceDataValidator,
  recordingResourcePatchValidator,
  recordingResourceQueryValidator
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  recordingResourceDataResolver,
  recordingResourceExternalResolver,
  recordingResourcePatchResolver,
  recordingResourceQueryResolver,
  recordingResourceResolver
} from './recording-resource.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(recordingResourceExternalResolver),
      schemaHooks.resolveResult(recordingResourceResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(recordingResourceQueryValidator),
      schemaHooks.resolveQuery(recordingResourceQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    get: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('recording', 'write'), verifyScope('settings', 'write')),
      schemaHooks.validateData(recordingResourceDataValidator),
      schemaHooks.resolveData(recordingResourceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      schemaHooks.validateData(recordingResourcePatchValidator),
      schemaHooks.resolveData(recordingResourcePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('recording', 'write'))]
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
