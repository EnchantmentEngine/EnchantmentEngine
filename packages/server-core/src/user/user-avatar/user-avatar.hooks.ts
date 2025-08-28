import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  userAvatarDataValidator,
  userAvatarPatchValidator,
  userAvatarQueryValidator,
  UserAvatarType
} from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { checkScope } from '@ir-engine/common/src/utils/checkScope'

import { HookContext } from '@feathersjs/feathers'
import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import { UserAvatarService } from './user-avatar.class'
import {
  userAvatarDataResolver,
  userAvatarExternalResolver,
  userAvatarPatchResolver,
  userAvatarQueryResolver,
  userAvatarResolver
} from './user-avatar.resolvers'

const ifNoEntry = async (context: HookContext<UserAvatarService>) => {
  const data = (Array.isArray(context.data) ? context.data : [context.data]) as UserAvatarType[]

  for (const item of data) {
    const entry = await context.service.find({
      userId: context.params.query.userId
    })
    if (entry.total === 0) {
      await context.service.create({ userId: context.params.query.userId, avatarId: item.avatarId })
    }
  }
  return
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(userAvatarExternalResolver), schemaHooks.resolveResult(userAvatarResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userAvatarQueryValidator), schemaHooks.resolveQuery(userAvatarQueryResolver)],
    find: [],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(userAvatarDataValidator),
      schemaHooks.resolveData(userAvatarDataResolver)
    ],
    patch: [
      iff(
        isProvider('external'),
        iffElse(
          async (context) => await checkScope(context.params.user, 'user', 'write'),
          [],
          [setLoggedinUserInQuery('userId')]
        )
      ),
      ifNoEntry,
      schemaHooks.validateData(userAvatarPatchValidator),
      schemaHooks.resolveData(userAvatarPatchResolver)
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
