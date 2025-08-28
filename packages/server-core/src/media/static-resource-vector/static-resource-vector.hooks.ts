import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  staticResourceVectorDataValidator,
  staticResourceVectorPatchValidator,
  staticResourceVectorQueryValidator
} from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { iff, isProvider } from 'feathers-hooks-common'
import verifyScope from '../../hooks/verify-scope'
import {
  staticResourceVectorDataResolver,
  staticResourceVectorExternalResolver,
  staticResourceVectorPatchResolver,
  staticResourceVectorQueryResolver,
  staticResourceVectorResolver
} from './static-resource-vector.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveResult(staticResourceVectorResolver),
      schemaHooks.resolveExternal(staticResourceVectorExternalResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(staticResourceVectorQueryValidator),
      schemaHooks.resolveQuery(staticResourceVectorQueryResolver)
    ],
    find: [
      // Only allow admin or editor access to vector search
      iff(isProvider('external'), verifyScope('editor', 'read'))
    ],
    get: [iff(isProvider('external'), verifyScope('editor', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'write')),
      schemaHooks.validateData(staticResourceVectorDataValidator),
      schemaHooks.resolveData(staticResourceVectorDataResolver)
    ],
    update: [
      iff(isProvider('external'), verifyScope('admin', 'write')),
      schemaHooks.validateData(staticResourceVectorDataValidator),
      schemaHooks.resolveData(staticResourceVectorDataResolver)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'write')),
      schemaHooks.validateData(staticResourceVectorPatchValidator),
      schemaHooks.resolveData(staticResourceVectorPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'write'))]
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
