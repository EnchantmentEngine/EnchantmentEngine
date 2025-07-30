import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'
import {
  projectDestinationCheckExternalResolver,
  projectDestinationCheckResolver
} from './project-destination-check.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectDestinationCheckExternalResolver),
      schemaHooks.resolveResult(projectDestinationCheckResolver)
    ]
  },

  before: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), verifyScope('projects', 'read'))],
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
