import { disallow } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [
      disallow('external'),
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
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
