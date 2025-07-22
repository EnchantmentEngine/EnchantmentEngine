// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { InviteCode, UserID, UserName, UserQuery, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'
import getFreeInviteCode from '../../util/get-free-invite-code'

export const userResolver = resolve<UserType, HookContext>({
  ageVerified: virtual(async (user, context) => {
    if (!config.server.requireAgeVerification) return true
    return !!user.ageVerified
  }),
  createdAt: virtual(async (user) => fromDateTimeSql(user.createdAt)),
  updatedAt: virtual(async (user) => fromDateTimeSql(user.updatedAt)),
  deactivatedAt: virtual(async (user) => (user.deactivatedAt ? fromDateTimeSql(user.deactivatedAt) : undefined))
})

export const userExternalResolver = resolve<UserType, HookContext>({
  // https://stackoverflow.com/a/56523892/2077741
  isGuest: async (value, user) => !!user.isGuest,
  isDeactivated: async (value, user) => !!user.isDeactivated
})

export const userDataResolver = resolve<UserType, HookContext>({
  id: async (id) => {
    return id || (uuidv4() as UserID)
  },
  name: async (name) => {
    return name || (('Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100)) as UserName)
  },
  inviteCode: async (inviteCode, _, context) => {
    return inviteCode || ((await getFreeInviteCode(context.app)) as InviteCode)
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userPatchResolver = resolve<UserType, HookContext>({
  updatedAt: getDateTimeSql,
  deactivatedAt: async (_, userData) => {
    if (userData.isDeactivated) {
      return getDateTimeSql()
    }
    return undefined
  }
})

export const userQueryResolver = resolve<UserQuery, HookContext>({})
