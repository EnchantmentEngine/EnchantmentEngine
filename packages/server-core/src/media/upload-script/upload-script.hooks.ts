
import { disallow, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest, MethodNotAllowed } from '@feathersjs/errors'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { featureFlagSettingPath } from '@ir-engine/common/src/schema.type.module'
import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { Application, HookContext } from '../../../declarations'

const validateFiles = (context: HookContext) => {
  const args = context.arguments
  const files = args?.[1]?.files as UploadFile[]
  if (!files) throw new BadRequest('No files provided')
  files.forEach((file: UploadFile) => {
    if (!file.originalname.includes('.')) throw new BadRequest('File name must include a file extension')
    if (
      !(
        file.originalname.endsWith('.tsx') ||
        file.originalname.endsWith('.ts') ||
        file.originalname.endsWith('.jsx') ||
        file.originalname.endsWith('.js')
      )
    ) {
      throw new BadRequest(
        'Unsupported file type:' +
          file.originalname.split('.').pop() +
          '. Only TypeScript (.tsx, .ts) and JavaScript (.jsx, .js) files are allowed.'
      )
    }
  })
}

/**
 * Check if the scripting feature flag is enabled
 * Disables the service if the flag is disabled
 */
const checkScriptingEnabled = async (context: HookContext) => {
  if (!isProvider('external')(context)) {
    return context
  }

  const app = context.app as Application
  const result = await app.service(featureFlagSettingPath).find({
    query: {
      flagName: FeatureFlags.Studio.Panel.Script
    }
  })

  const data = result.data || result
  if (Array.isArray(data) && data.length > 0 && !data[0].flagValue) {
    throw new MethodNotAllowed('Scripting is disabled')
  }

  return context
}

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [checkScriptingEnabled, setLoggedInUser('userId'), validateFiles],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext) => {
        ;(context as any)[SYNC] = false
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
