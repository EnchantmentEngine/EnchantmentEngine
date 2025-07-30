// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { ProjectHistoryQuery, ProjectHistoryType } from '@ir-engine/common/src/schemas/projects/project-history.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectHistoryResolver = resolve<ProjectHistoryType, HookContext>({
  createdAt: virtual(async (projectHistory) => fromDateTimeSql(projectHistory.createdAt))
})

export const projectHistoryDataResolver = resolve<ProjectHistoryType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql
})

const getUserNameAndAvatarURL = (projectHistory: ProjectHistoryType, context: HookContext) => {
  if (context.method !== 'find') {
    return {
      userName: '',
      userAvatarURL: ''
    }
  }

  if (!projectHistory.userId) {
    return {
      userName: 'Admin',
      userAvatarURL: ''
    }
  }

  const userInfo = context.userInfo[projectHistory.userId] as {
    userName: string
    userAvatarURL: string
  }

  return userInfo
}

export const projectHistoryExternalResolver = resolve<ProjectHistoryType, HookContext>({
  userName: virtual(async (projectHistory, context) => {
    return getUserNameAndAvatarURL(projectHistory, context).userName
  }),

  userAvatarURL: virtual(async (projectHistory, context) => {
    return getUserNameAndAvatarURL(projectHistory, context).userAvatarURL
  })
})

export const projectHistoryQueryResolver = resolve<ProjectHistoryQuery, HookContext>({})
