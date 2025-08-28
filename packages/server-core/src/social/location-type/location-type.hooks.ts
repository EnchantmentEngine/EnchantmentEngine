import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  locationTypeDataValidator,
  locationTypePatchValidator,
  locationTypeQueryValidator
} from '@ir-engine/common/src/schemas/social/location-type.schema'

import {
  locationTypeDataResolver,
  locationTypeExternalResolver,
  locationTypePatchResolver,
  locationTypeQueryResolver,
  locationTypeResolver
} from './location-type.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationTypeExternalResolver), schemaHooks.resolveResult(locationTypeResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(locationTypeQueryValidator), schemaHooks.resolveQuery(locationTypeQueryResolver)],
    find: [],
    get: [],
    create: [
      disallow('external'),
      schemaHooks.validateData(locationTypeDataValidator),
      schemaHooks.resolveData(locationTypeDataResolver)
    ],
    update: [disallow()],
    patch: [
      disallow(),
      schemaHooks.validateData(locationTypePatchValidator),
      schemaHooks.resolveData(locationTypePatchResolver)
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
