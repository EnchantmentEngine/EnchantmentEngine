import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import { smsDataValidator } from '@ir-engine/common/src/schemas/user/sms.schema'

export default {
  before: {
    all: [disallow('external')],
    find: [],
    get: [],
    create: [schemaHooks.validateData(smsDataValidator)],
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
