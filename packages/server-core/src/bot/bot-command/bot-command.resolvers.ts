// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { BotCommandQuery, BotCommandType } from '@ir-engine/common/src/schemas/bot/bot-command.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const botCommandResolver = resolve<BotCommandType, HookContext>({
  createdAt: virtual(async (botCommand) => fromDateTimeSql(botCommand.createdAt)),
  updatedAt: virtual(async (botCommand) => fromDateTimeSql(botCommand.updatedAt))
})

export const botCommandExternalResolver = resolve<BotCommandType, HookContext>({})

export const botCommandDataResolver = resolve<BotCommandType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const botCommandPatchResolver = resolve<BotCommandType, HookContext>({
  updatedAt: getDateTimeSql
})

export const botCommandQueryResolver = resolve<BotCommandQuery, HookContext>({})
