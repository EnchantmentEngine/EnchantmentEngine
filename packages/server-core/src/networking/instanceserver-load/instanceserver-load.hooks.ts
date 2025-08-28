import { disallow, iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [iff(isProvider('external'), verifyScope('instance', 'write'))],
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
