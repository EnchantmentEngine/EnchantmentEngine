import { disallow, iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    update: [disallow()],
    patch: [disallow()],
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
