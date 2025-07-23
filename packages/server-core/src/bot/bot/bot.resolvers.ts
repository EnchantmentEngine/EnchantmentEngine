// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { BotCommandData, botCommandPath, BotCommandType } from '@ir-engine/common/src/schemas/bot/bot-command.schema'
import { BotQuery, BotType } from '@ir-engine/common/src/schemas/bot/bot.schema'
import { InstanceID, instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

import { botCommandDataResolver } from '../bot-command/bot-command.resolvers'

export const botResolver = resolve<BotType, HookContext>({})

export const botExternalResolver = resolve<BotType, HookContext>({
  location: virtual(async (bot, context) => {
    if (context.event !== 'removed' && bot.locationId)
      return await context.app.service(locationPath).get(bot.locationId)
  }),
  instance: virtual(async (bot, context) => {
    if (context.event !== 'removed' && bot.instanceId)
      return (await context.app.service(instancePath).get(bot.instanceId)) as any as InstanceType
  }),
  botCommands: virtual(async (bot, context) => {
    if (context.event !== 'removed' && bot.id)
      return (await context.app.service(botCommandPath).find({
        query: {
          botId: bot.id
        },
        paginate: false
      })) as BotCommandType[]
  }),
  createdAt: virtual(async (bot) => fromDateTimeSql(bot.createdAt)),
  updatedAt: virtual(async (bot) => fromDateTimeSql(bot.updatedAt))
})

export const botDataResolver = resolve<BotType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  instanceId: async (instanceId) => {
    return instanceId ?? ('' as InstanceID)
  },
  botCommands: async (value, bot, context) => {
    const botCommands: BotCommandData[] = []
    for (const element of bot.botCommands) {
      const resolvedElement = await botCommandDataResolver.resolve(element, context)
      botCommands.push(resolvedElement)
    }
    return botCommands
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const botPatchResolver = resolve<BotType, HookContext>({
  updatedAt: getDateTimeSql
})

export const botQueryResolver = resolve<BotQuery, HookContext>({})
