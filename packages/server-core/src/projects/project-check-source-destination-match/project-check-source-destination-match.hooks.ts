import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'
import {
  projectCheckSourceDestinationMatchExternalResolver,
  projectCheckSourceDestinationMatchResolver
} from './project-check-source-destination-match.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectCheckSourceDestinationMatchExternalResolver),
      schemaHooks.resolveResult(projectCheckSourceDestinationMatchResolver)
    ]
  },

  before: {
    all: [],
    find: [iff(isProvider('external'), verifyScope('projects', 'read'))],
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
