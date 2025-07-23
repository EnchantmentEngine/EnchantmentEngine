// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { RouteID, RouteQuery, RouteType } from '@ir-engine/common/src/schemas/route/route.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const routeResolver = resolve<RouteType, HookContext>({
  createdAt: virtual(async (route) => fromDateTimeSql(route.createdAt)),
  updatedAt: virtual(async (route) => fromDateTimeSql(route.updatedAt))
})

export const routeExternalResolver = resolve<RouteType, HookContext>({})

export const routeDataResolver = resolve<RouteType, HookContext>({
  id: async () => {
    return uuidv4() as RouteID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const routePatchResolver = resolve<RouteType, HookContext>({
  updatedAt: getDateTimeSql
})

export const routeQueryResolver = resolve<RouteQuery, HookContext>({})
