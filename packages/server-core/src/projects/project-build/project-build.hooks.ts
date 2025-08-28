import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { projectBuildPatchValidator } from '@ir-engine/common/src/schemas/projects/project-build.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  projectBuildExternalResolver,
  projectBuildPatchResolver,
  projectBuildResolver
} from './project-build.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(projectBuildExternalResolver), schemaHooks.resolveResult(projectBuildResolver)]
  },

  before: {
    all: [],
    find: [iff(isProvider('external'), verifyScope('projects', 'read'))],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('projects', 'write')),
      schemaHooks.validateData(projectBuildPatchValidator),
      schemaHooks.resolveData(projectBuildPatchResolver)
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
