// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { MatchUserQuery, MatchUserType } from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const matchUserResolver = resolve<MatchUserType, HookContext>({
  createdAt: virtual(async (matchUser) => fromDateTimeSql(matchUser.createdAt)),
  updatedAt: virtual(async (matchUser) => fromDateTimeSql(matchUser.updatedAt))
})

export const matchUserExternalResolver = resolve<MatchUserType, HookContext>({})

export const matchUserDataResolver = resolve<MatchUserType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchUserPatchResolver = resolve<MatchUserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const matchUserQueryResolver = resolve<MatchUserQuery, HookContext>({})
