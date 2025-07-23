// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { ScopeID, ScopeQuery, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const scopeResolver = resolve<ScopeTypeInterface, HookContext>({})

export const scopeExternalResolver = resolve<ScopeTypeInterface, HookContext>({
  createdAt: virtual(async (scope) => fromDateTimeSql(scope.createdAt)),
  updatedAt: virtual(async (scope) => fromDateTimeSql(scope.updatedAt))
})

export const scopeDataResolver = resolve<ScopeTypeInterface, HookContext>({
  id: async () => {
    return uuidv4() as ScopeID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const scopePatchResolver = resolve<ScopeTypeInterface, HookContext>({
  updatedAt: getDateTimeSql
})

export const scopeQueryResolver = resolve<ScopeQuery, HookContext>({})
