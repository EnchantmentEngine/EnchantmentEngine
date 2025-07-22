import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import { emailDataValidator } from '@ir-engine/common/src/schemas/user/email.schema'

import refreshApiPods from '../../hooks/refresh-api-pods'

export default {
  before: {
    all: [disallow('external')],
    find: [],
    get: [],
    create: [schemaHooks.validateData(emailDataValidator)],
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
    patch: [refreshApiPods],
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
