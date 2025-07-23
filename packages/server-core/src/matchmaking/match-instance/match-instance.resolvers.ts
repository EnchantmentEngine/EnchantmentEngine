// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { MatchInstanceQuery, MatchInstanceType } from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const matchInstanceResolver = resolve<MatchInstanceType, HookContext>({
  createdAt: virtual(async (matchInstance) => fromDateTimeSql(matchInstance.createdAt)),
  updatedAt: virtual(async (matchInstance) => fromDateTimeSql(matchInstance.updatedAt))
})

export const matchInstanceExternalResolver = resolve<MatchInstanceType, HookContext>({})

export const matchInstanceDataResolver = resolve<MatchInstanceType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchInstancePatchResolver = resolve<MatchInstanceType, HookContext>({
  updatedAt: getDateTimeSql
})

export const matchInstanceQueryResolver = resolve<MatchInstanceQuery, HookContext>({})
