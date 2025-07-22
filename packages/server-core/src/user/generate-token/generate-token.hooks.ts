import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  generateTokenDataValidator,
  generateTokenPatchValidator,
  generateTokenQueryValidator
} from '@ir-engine/common/src/schemas/user/generate-token.schema'

import {
  generateTokenDataResolver,
  generateTokenExternalResolver,
  generateTokenPatchResolver,
  generateTokenQueryResolver,
  generateTokenResolver
} from './generate-token.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(generateTokenExternalResolver), schemaHooks.resolveResult(generateTokenResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(generateTokenQueryValidator), schemaHooks.resolveQuery(generateTokenQueryResolver)],
    find: [],
    get: [],
    create: [schemaHooks.validateData(generateTokenDataValidator), schemaHooks.resolveData(generateTokenDataResolver)],
    update: [],
    patch: [schemaHooks.validateData(generateTokenPatchValidator), schemaHooks.resolveData(generateTokenPatchResolver)],
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
