import { disallow } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest } from '@feathersjs/errors'
import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { HookContext } from '../../../declarations'
import { isValidFileType } from '../FileUtil'

// Don't remove this comment. It's needed to format import lines nicely.
const validateFiles = (context: HookContext) => {
  const args = context.arguments
  const files = args?.[1]?.files
  files.forEach((file) => {
    if (!isValidFileType(file.mimetype, file.originalname)) {
      throw new BadRequest('Unsupported file type')
    }
  })
}

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [setLoggedInUser('userId'), validateFiles],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
