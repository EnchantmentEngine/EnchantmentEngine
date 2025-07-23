import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  ScopeData,
  scopeDataValidator,
  ScopeID,
  scopePath,
  scopeQueryValidator,
  ScopeTypeInterface
} from '@ir-engine/common/src/schemas/scope/scope.schema'

import { HookContext } from '../../../declarations'
import enableClientPagination from '../../hooks/enable-client-pagination'
import verifyScope from '../../hooks/verify-scope'
import verifyScopeAllowingSelf from '../../hooks/verify-scope-allowing-self'
import { ScopeService } from './scope.class'
import { scopeDataResolver, scopeExternalResolver, scopeQueryResolver, scopeResolver } from './scope.resolvers'

/**
 * Check and maintain existing scopes
 * @param context
 * @returns
 */
const checkExistingScopes = async (context: HookContext<ScopeService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ScopeData[] = Array.isArray(context.data) ? context.data : [context.data]

  // TODO: Make this generic so that even if request contains different user ids, it should work
  const oldScopes = (await context.app.service(scopePath).find({
    query: { userId: data[0].userId },
    paginate: false
  })) as any as ScopeTypeInterface[]

  const existingData: ScopeID[] = []

  for (const item of data) {
    const existingScope = oldScopes && oldScopes.find((el) => el.type === item.type)
    if (existingScope) existingData.push(existingScope.id)
  }

  await context.app.service(scopePath).remove(null, {
    query: {
      id: {
        $in: existingData
      },
      userId: data[0].userId
    }
  })
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(scopeExternalResolver), schemaHooks.resolveResult(scopeResolver)]
  },
  before: {
    all: [schemaHooks.validateQuery(scopeQueryValidator), schemaHooks.resolveQuery(scopeQueryResolver)],
    find: [iff(isProvider('external'), verifyScopeAllowingSelf('user', 'read')), enableClientPagination()],
    get: [iff(isProvider('external'), verifyScopeAllowingSelf('user', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('user', 'write'), verifyScope('admin', 'admin')),
      schemaHooks.validateData(scopeDataValidator),
      schemaHooks.resolveData(scopeDataResolver),
      checkExistingScopes
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'), verifyScope('user', 'write'), verifyScope('admin', 'admin'))]
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
