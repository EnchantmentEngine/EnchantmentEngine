// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ProjectPermissionQuery,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectPermissionResolver = resolve<ProjectPermissionType, HookContext>({
  user: virtual(async (projectPermission, context) => {
    if (projectPermission.userId) return await context.app.service(userPath).get(projectPermission.userId)
  }),
  createdAt: virtual(async (projectPermission) => fromDateTimeSql(projectPermission.createdAt)),
  updatedAt: virtual(async (projectPermission) => fromDateTimeSql(projectPermission.updatedAt))
})

export const projectPermissionExternalResolver = resolve<ProjectPermissionType, HookContext>({})

export const projectPermissionDataResolver = resolve<ProjectPermissionType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectPermissionPatchResolver = resolve<ProjectPermissionType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectPermissionQueryResolver = resolve<ProjectPermissionQuery, HookContext>({})
