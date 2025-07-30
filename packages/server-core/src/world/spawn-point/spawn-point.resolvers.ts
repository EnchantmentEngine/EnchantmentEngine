// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { SpawnPointQuery, SpawnPointType } from '@ir-engine/common/src/schema.type.module'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { EntityUUID } from '@ir-engine/ecs'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const spawnPointResolver = resolve<SpawnPointType, HookContext>({
  createdAt: virtual(async (spawnPoint) => fromDateTimeSql(spawnPoint.createdAt)),
  updatedAt: virtual(async (spawnPoint) => fromDateTimeSql(spawnPoint.updatedAt))
})

export const spawnPointExternalResolver = resolve<SpawnPointType, HookContext>({})

export const spawnPointDataResolver = resolve<SpawnPointType, HookContext>({
  id: async () => {
    return v4() as EntityUUID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const spawnPointPatchResolver = resolve<SpawnPointType, HookContext>({
  updatedAt: getDateTimeSql
})

export const spawnPointQueryResolver = resolve<SpawnPointQuery, HookContext>({})
