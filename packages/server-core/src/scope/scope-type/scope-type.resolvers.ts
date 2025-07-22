// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'

import { ScopeTypeQuery, ScopeTypeType } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const scopeTypeResolver = resolve<ScopeTypeType, HookContext>({
  createdAt: virtual(async (scopeType) => fromDateTimeSql(scopeType.createdAt)),
  updatedAt: virtual(async (scopeType) => fromDateTimeSql(scopeType.updatedAt))
})

export const scopeTypeExternalResolver = resolve<ScopeTypeType, HookContext>({})

export const scopeTypeDataResolver = resolve<ScopeTypeType, HookContext>({
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const scopeTypePatchResolver = resolve<ScopeTypeType, HookContext>({
  updatedAt: getDateTimeSql
})

export const scopeTypeQueryResolver = resolve<ScopeTypeQuery, HookContext>({})
