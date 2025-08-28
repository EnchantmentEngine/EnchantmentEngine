import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  projectHistoryDataValidator,
  projectHistoryQueryValidator
} from '@ir-engine/common/src/schemas/projects/project-history.schema'

import {
  projectHistoryDataResolver,
  projectHistoryExternalResolver,
  projectHistoryQueryResolver,
  projectHistoryResolver
} from './project-history.resolvers'

import {
  AvatarID,
  avatarPath,
  AvatarType,
  userAvatarPath,
  UserID,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import checkScope from '../../hooks/check-scope'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import { ProjectHistoryService } from './project-history.class'

const populateUsernameAndAvatar = async (context: HookContext<ProjectHistoryService>) => {
  if (!context.result) return
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  const userIds: UserID[] = []

  for (const data of dataArr) {
    const { userId } = data
    if (userId) userIds.push(userId)
  }
  const uniqueUsers = [...new Set(userIds)]
  const nonNullUsers = uniqueUsers.filter((userId) => !!userId)

  const users = await context.app.service(userPath).find({
    query: {
      id: {
        $in: nonNullUsers
      }
    },
    paginate: false
  })

  const userAvatars = await context.app.service(userAvatarPath).find({
    query: {
      userId: {
        $in: nonNullUsers
      }
    },
    paginate: false
  })

  const uniqueUserAvatarIds = [...new Set(userAvatars.map((avatar) => avatar.avatarId))]
  const avatars = await context.app.service(avatarPath).find({
    query: {
      id: {
        $in: uniqueUserAvatarIds
      }
    },
    paginate: false
  })

  const avatarIdAvatarMap = {} as Record<AvatarID, AvatarType>
  for (const avatar of avatars) {
    avatarIdAvatarMap[avatar.id] = avatar
  }

  const userIdAvatarIdMap = {} as Record<UserID, AvatarType>
  for (const userAvatar of userAvatars) {
    userIdAvatarIdMap[userAvatar.userId] = avatarIdAvatarMap[userAvatar.avatarId]
  }

  const usersInfo = {} as Record<UserID, { userName: string; userAvatarURL: string }>
  for (const user of users) {
    usersInfo[user.id] = {
      userName: user.name,
      userAvatarURL: userIdAvatarIdMap[user.id].thumbnailResource?.url || ''
    }
  }

  context.userInfo = usersInfo
}

export default {
  around: {
    all: [
      schemaHooks.resolveResult(projectHistoryResolver),
      schemaHooks.resolveExternal(projectHistoryExternalResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectHistoryQueryValidator),
      schemaHooks.resolveQuery(projectHistoryQueryResolver)
    ],
    find: [
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'read'), [], verifyProjectPermission(['owner', 'editor']))
      )
    ],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(projectHistoryDataValidator),
      schemaHooks.resolveData(projectHistoryDataResolver)
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [populateUsernameAndAvatar],
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
