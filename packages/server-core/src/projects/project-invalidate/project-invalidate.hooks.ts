import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { projectInvalidatePatchValidator } from '@ir-engine/common/src/schemas/projects/project-invalidate.schema'

import verifyScope from '../../hooks/verify-scope'
import { projectInvalidatePatchResolver } from './project-invalidate.resolvers'

export default {
  around: {
    all: []
  },

  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('projects', 'write')),
      schemaHooks.validateData(projectInvalidatePatchValidator),
      schemaHooks.resolveData(projectInvalidatePatchResolver)
    ],
    remove: [disallow()]
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
