import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  userApiKeyDataValidator,
  userApiKeyPatchValidator,
  userApiKeyQueryValidator
} from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'

import { HookContext } from '../../../declarations'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import { UserApiKeyService } from './user-api-key.class'
import {
  userApiKeyDataResolver,
  userApiKeyExternalResolver,
  userApiKeyPatchResolver,
  userApiKeyQueryResolver,
  userApiKeyResolver
} from './user-api-key.resolvers'

/**
 * Ensure user is modifying their own api key
 * @param context
 * @returns
 */
const ensureUserOwnsApiKey = async (context: HookContext<UserApiKeyService>) => {
  if (context.method !== 'patch') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  if (context.id) {
    const userApiKey = await context.service.get(context.id)
    if (userApiKey.userId !== context.params.user!.id) {
      throw new BadRequest(`${context.path} service ${context.id} not owned by user`)
    }
  }
}

/**
 * Ensure user does not already own an api key
 * @param context
 * @returns
 */
const ensureUserDoesNotHaveApiKey = async (context: HookContext<UserApiKeyService>) => {
  if (context.method !== 'create') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  const userApiKey = await context.service.find({
    query: {
      userId
    }
  })

  if (userApiKey.data.length > 0) {
    throw new BadRequest(`${context.path} service user already owns an api key`)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(userApiKeyExternalResolver), schemaHooks.resolveResult(userApiKeyResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userApiKeyQueryValidator), schemaHooks.resolveQuery(userApiKeyQueryResolver)],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      schemaHooks.validateData(userApiKeyDataValidator),
      schemaHooks.resolveData(userApiKeyDataResolver),
      iff(isProvider('external'), ensureUserDoesNotHaveApiKey),
      iff(isProvider('external'), setLoggedInUser('userId'))
    ],
    update: [disallow('external')],
    patch: [
      schemaHooks.validateData(userApiKeyPatchValidator),
      schemaHooks.resolveData(userApiKeyPatchResolver),
      iff(isProvider('external'), ensureUserOwnsApiKey),
      iff(isProvider('external'), attachOwnerIdInQuery('userId')),
      iff(isProvider('external'), setLoggedInUser('userId'))
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
