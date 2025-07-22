import { iff, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest } from '@feathersjs/errors'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { isValidFileType } from '../FileUtil'

const validateFile = (context: HookContext) => {
  const args = context.arguments
  const file = args?.[1]?.files?.[0]

  if (!isValidFileType(file.mimetype, file.originalname)) {
    throw new BadRequest('Unsupported file type')
  }
}

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    find: [disallow()],
    get: [disallow()],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      },
      validateFile
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
