import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import {
  fileBrowserPatchValidator,
  fileBrowserUpdateValidator
} from '@ir-engine/common/src/schemas/media/file-browser.schema'

import { HookContext } from '@feathersjs/feathers'
import { cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import verifyScope from '../../hooks/verify-scope'
import { FileBrowserService } from './file-browser.class'

const cleanFileName = () => {
  return async (context: HookContext<FileBrowserService>) => {
    context.data.path = cleanFileNameString(context.data.path, true)
    return context
  }
}

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    update: [schemaHooks.validateData(fileBrowserUpdateValidator)],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      },
      schemaHooks.validateData(fileBrowserPatchValidator),
      cleanFileName(),
      verifyProjectPermission(['owner', 'editor'])
    ],
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
