import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  spawnPointDataValidator,
  spawnPointQueryValidator
} from '@ir-engine/common/src/schemas/world/spawn-point.schema'

import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import enableClientPagination from '../../hooks/enable-client-pagination'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  spawnPointDataResolver,
  spawnPointExternalResolver,
  spawnPointQueryResolver,
  spawnPointResolver
} from './spawn-point.resolvers'

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(spawnPointExternalResolver), schemaHooks.resolveResult(spawnPointResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(spawnPointQueryValidator), schemaHooks.resolveQuery(spawnPointQueryResolver)],
      find: [enableClientPagination()],
      get: [],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.validateData(spawnPointDataValidator),
        schemaHooks.resolveData(spawnPointDataResolver)
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.validateData(spawnPointDataValidator),
        schemaHooks.resolveData(spawnPointDataResolver)
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.validateData(spawnPointDataValidator),
        schemaHooks.resolveData(spawnPointDataResolver)
      ],
      remove: [iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false))]
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
  },
  ['find']
)
