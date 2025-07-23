// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { ChannelUserQuery, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const channelUserResolver = resolve<ChannelUserType, HookContext>({
  user: virtual(async (channelUser, context) => {
    if (channelUser.userId) return await context.app.service(userPath).get(channelUser.userId)
  }),
  createdAt: virtual(async (channel) => fromDateTimeSql(channel.createdAt)),
  updatedAt: virtual(async (channel) => fromDateTimeSql(channel.updatedAt))
})

export const channelUserExternalResolver = resolve<ChannelUserType, HookContext>({})

export const channelUserDataResolver = resolve<ChannelUserType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const channelUserPatchResolver = resolve<ChannelUserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const channelUserQueryResolver = resolve<ChannelUserQuery, HookContext>({})
