import setLoggedInUser from '../../hooks/set-loggedin-user-in-body'

export default {
  before: {
    all: [],
    find: [setLoggedInUser('userId')],
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
