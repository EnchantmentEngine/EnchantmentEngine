// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'

import { BuildStatusQuery, BuildStatusType } from '@ir-engine/common/src/schemas/cluster/build-status.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const buildStatusResolver = resolve<BuildStatusType, HookContext>({
  createdAt: virtual(async (buildStatus) => fromDateTimeSql(buildStatus.createdAt)),
  updatedAt: virtual(async (buildStatus) => fromDateTimeSql(buildStatus.updatedAt))
})

export const buildStatusExternalResolver = resolve<BuildStatusType, HookContext>({})

export const buildStatusDataResolver = resolve<BuildStatusType, HookContext>({
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const buildStatusPatchResolver = resolve<BuildStatusType, HookContext>({
  updatedAt: getDateTimeSql
})

export const buildStatusQueryResolver = resolve<BuildStatusQuery, HookContext>({})
