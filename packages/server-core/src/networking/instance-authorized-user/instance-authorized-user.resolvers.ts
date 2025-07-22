// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  InstanceAuthorizedUserQuery,
  InstanceAuthorizedUserType
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const instanceAuthorizedUserResolver = resolve<InstanceAuthorizedUserType, HookContext>({
  createdAt: virtual(async (instanceAuthorizedUser) => fromDateTimeSql(instanceAuthorizedUser.createdAt)),
  updatedAt: virtual(async (instanceAuthorizedUser) => fromDateTimeSql(instanceAuthorizedUser.updatedAt))
})

export const instanceAuthorizedUserExternalResolver = resolve<InstanceAuthorizedUserType, HookContext>({})

export const instanceAuthorizedUserDataResolver = resolve<InstanceAuthorizedUserType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const instanceAuthorizedUserPatchResolver = resolve<InstanceAuthorizedUserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const instanceAuthorizedUserQueryResolver = resolve<InstanceAuthorizedUserQuery, HookContext>({})
