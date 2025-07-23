import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  featureFlagSettingDataValidator,
  featureFlagSettingPatchValidator,
  featureFlagSettingQueryValidator
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'
import setLoggedInUserInData from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { iff, isProvider } from 'feathers-hooks-common'

import enableClientPagination from '../../hooks/enable-client-pagination'
import verifyScope from '../../hooks/verify-scope'
import {
  featureFlagSettingDataResolver,
  featureFlagSettingExternalResolver,
  featureFlagSettingPatchResolver,
  featureFlagSettingQueryResolver,
  featureFlagSettingResolver
} from './feature-flag-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(featureFlagSettingExternalResolver),
      schemaHooks.resolveResult(featureFlagSettingResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(featureFlagSettingQueryValidator),
      schemaHooks.resolveQuery(featureFlagSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), enableClientPagination())],
    get: [],
    create: [
      setLoggedInUserInData('userId'),
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(featureFlagSettingDataValidator),
      schemaHooks.resolveData(featureFlagSettingDataResolver)
    ],
    update: [setLoggedInUserInData('userId'), iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      setLoggedInUserInData('userId'),
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(featureFlagSettingPatchValidator),
      schemaHooks.resolveData(featureFlagSettingPatchResolver)
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
