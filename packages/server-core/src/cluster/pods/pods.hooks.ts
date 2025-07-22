import { disallow, iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external'), verifyScope('server', 'read'))],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'), verifyScope('server', 'write'))]
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
