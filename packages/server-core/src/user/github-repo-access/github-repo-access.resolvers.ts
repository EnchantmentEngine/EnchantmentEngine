// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  GithubRepoAccessQuery,
  GithubRepoAccessType
} from '@ir-engine/common/src/schemas/user/github-repo-access.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const githubRepoAccessResolver = resolve<GithubRepoAccessType, HookContext>({
  createdAt: virtual(async (githubRepoAccess) => fromDateTimeSql(githubRepoAccess.createdAt)),
  updatedAt: virtual(async (githubRepoAccess) => fromDateTimeSql(githubRepoAccess.updatedAt))
})

export const githubRepoAccessExternalResolver = resolve<GithubRepoAccessType, HookContext>({})

export const githubRepoAccessDataResolver = resolve<GithubRepoAccessType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const githubRepoAccessPatchResolver = resolve<GithubRepoAccessType, HookContext>({
  updatedAt: getDateTimeSql
})

export const githubRepoAccessQueryResolver = resolve<GithubRepoAccessQuery, HookContext>({})
