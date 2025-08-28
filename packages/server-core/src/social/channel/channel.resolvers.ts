// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { channelUserPath, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { ChannelID, ChannelQuery, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const channelResolver = resolve<ChannelType, HookContext>({
  createdAt: virtual(async (channel) => fromDateTimeSql(channel.createdAt)),
  updatedAt: virtual(async (channel) => fromDateTimeSql(channel.updatedAt))
})

export const channelExternalResolver = resolve<ChannelType, HookContext>({
  channelUsers: virtual(async (channel: ChannelType, context: HookContext) => {
    if ((context.method === 'find' || context.method === 'get') && !context.params.query?.instanceId) {
      return (await context.app.service(channelUserPath).find({
        query: {
          channelId: channel.id
        },
        paginate: false
      })) as ChannelUserType[]
    }
  }),

  // Add latest message to each channel
  lastMessage: virtual(async (channel: ChannelType, context: HookContext) => {
    if (context.method === 'find' || context.method === 'get') {
      // Get the latest message for this channel
      const messages = await context.app.service('message').find({
        query: {
          channelId: channel.id,
          $limit: 1,
          $sort: { createdAt: -1 }
        },
        paginate: false
      })

      // Return the first message if available, otherwise undefined
      return messages.length > 0 ? messages[0] : undefined
    }
    return undefined
  })
})

export const channelDataResolver = resolve<ChannelType, HookContext>({
  id: async () => {
    return uuidv4() as ChannelID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const channelPatchResolver = resolve<ChannelType, HookContext>({
  updatedAt: getDateTimeSql
})

export const channelQueryResolver = resolve<ChannelQuery, HookContext>({})
