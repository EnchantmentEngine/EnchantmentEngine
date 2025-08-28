import { disallow, iff, isProvider } from 'feathers-hooks-common'

import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'

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
    patch: [iff(isProvider('external'), verifyScope('projects', 'write'), projectPermissionAuthenticate('write'))],
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
