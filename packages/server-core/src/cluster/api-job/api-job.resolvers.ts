// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { ApiJobQuery, ApiJobType } from '@ir-engine/common/src/schemas/cluster/api-job.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const apiJobResolver = resolve<ApiJobType, HookContext>({
  startTime: virtual(async (apiJob) => fromDateTimeSql(apiJob.startTime)),
  endTime: virtual(async (apiJob) => fromDateTimeSql(apiJob.endTime)),
  createdAt: virtual(async (apiJob) => fromDateTimeSql(apiJob.createdAt)),
  updatedAt: virtual(async (apiJob) => fromDateTimeSql(apiJob.updatedAt))
})

export const apiJobExternalResolver = resolve<ApiJobType, HookContext>({})

export const apiJobDataResolver = resolve<ApiJobType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const apiJobPatchResolver = resolve<ApiJobType, HookContext>({
  updatedAt: getDateTimeSql
})

export const apiJobQueryResolver = resolve<ApiJobQuery, HookContext>({})
