import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  engineSettingDataValidator,
  engineSettingPatchValidator,
  engineSettingQueryValidator
} from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { iff, iffElse, isProvider } from 'feathers-hooks-common'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import setInContext from '../../hooks/set-in-context'
import verifyScope from '../../hooks/verify-scope'
import {
  engineSettingDataResolver,
  engineSettingExternalResolver,
  engineSettingPatchResolver,
  engineSettingQueryResolver,
  engineSettingResolver
} from './engine-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(engineSettingExternalResolver), schemaHooks.resolveResult(engineSettingResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(engineSettingQueryValidator), schemaHooks.resolveQuery(engineSettingQueryResolver)],
    find: [
      iff(isProvider('external'), enableClientPagination()),
      iff(isProvider('external'), iffElse(checkScope('settings', 'read'), [], setInContext('type', 'public')))
    ],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(engineSettingDataValidator),
      schemaHooks.resolveData(engineSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(engineSettingPatchValidator),
      schemaHooks.resolveData(engineSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('settings', 'write'))]
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
