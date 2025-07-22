// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { InvalidationQuery, InvalidationType } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const invalidationResolver = resolve<InvalidationType, HookContext>({
  createdAt: virtual(async (invalidation) => fromDateTimeSql(invalidation.createdAt)),
  updatedAt: virtual(async (invalidation) => fromDateTimeSql(invalidation.updatedAt))
})

export const invalidationExternalResolver = resolve<InvalidationType, HookContext>({})

export const invalidationDataResolver = resolve<InvalidationType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const invalidationQueryResolver = resolve<InvalidationQuery, HookContext>({})
