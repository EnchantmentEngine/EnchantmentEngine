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
      (...args) => {
        try {
          console.trace('Validating data in location-setting hooks:', args[0], args[1])
          return schemaHooks.validateData(locationSettingDataValidator)(args[0], args[1])
        } catch (error) {
          console.error('Error validating data in location-setting hooks:', error, ...args)
        }
      },
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
