import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  userRelationshipTypeDataValidator,
  userRelationshipTypePatchValidator,
  userRelationshipTypeQueryValidator
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'

import {
  userRelationshipTypeDataResolver,
  userRelationshipTypeExternalResolver,
  userRelationshipTypePatchResolver,
  userRelationshipTypeQueryResolver,
  userRelationshipTypeResolver
} from './user-relationship-type.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(userRelationshipTypeExternalResolver),
      schemaHooks.resolveResult(userRelationshipTypeResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(userRelationshipTypeQueryValidator),
      schemaHooks.resolveQuery(userRelationshipTypeQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      disallow('external'),
      schemaHooks.validateData(userRelationshipTypeDataValidator),
      schemaHooks.resolveData(userRelationshipTypeDataResolver)
    ],
    update: [disallow()],
    patch: [
      disallow(),
      schemaHooks.validateData(userRelationshipTypePatchValidator),
      schemaHooks.resolveData(userRelationshipTypePatchResolver)
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
