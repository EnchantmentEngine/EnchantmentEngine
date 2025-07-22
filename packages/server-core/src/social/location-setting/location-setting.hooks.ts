import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  locationSettingDataValidator,
  locationSettingPatchValidator,
  locationSettingQueryValidator
} from '@ir-engine/common/src/schemas/social/location-setting.schema'

import {
  locationSettingDataResolver,
  locationSettingExternalResolver,
  locationSettingPatchResolver,
  locationSettingQueryResolver,
  locationSettingResolver
} from './location-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(locationSettingExternalResolver),
      schemaHooks.resolveResult(locationSettingResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(locationSettingQueryValidator),
      schemaHooks.resolveQuery(locationSettingQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      disallow('external'),
      schemaHooks.validateData(locationSettingDataValidator),
      schemaHooks.resolveData(locationSettingDataResolver)
    ],
    update: [disallow('external')],
    patch: [
      disallow('external'),
      schemaHooks.validateData(locationSettingPatchValidator),
      schemaHooks.resolveData(locationSettingPatchResolver)
    ],
    remove: [disallow('external')]
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
