import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common'

import { BotCommandData, botCommandPath, BotCommandType } from '@ir-engine/common/src/schemas/bot/bot-command.schema'
import {
  botDataValidator,
  botPatchValidator,
  botQueryValidator,
  BotType
} from '@ir-engine/common/src/schemas/bot/bot.schema'

import { HookContext } from '../../../declarations'
import {
  botDataResolver,
  botExternalResolver,
  botPatchResolver,
  botQueryResolver,
  botResolver
} from '../../bot/bot/bot.resolvers'
import persistData from '../../hooks/persist-data'
import verifyScope from '../../hooks/verify-scope'
import { BotService } from './bot.class'

async function addBotCommands(context: HookContext<BotService>) {
  const process = async (bot: BotType, botCommandData: BotCommandData[]) => {
    const botCommands: BotCommandType[] = await Promise.all(
      botCommandData.map((commandData) =>
        context.app.service(botCommandPath).create({
          ...commandData,
          botId: bot.id
        })
      )
    )
    bot.botCommands = botCommands
  }

  if (Array.isArray(context.result)) {
    await Promise.all(context.result.map((bot, idx) => process(bot, context.actualData[idx].botCommands)))
  } else {
    await process(context.result as BotType, context.actualData.botCommands)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(botExternalResolver), schemaHooks.resolveResult(botResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(botQueryValidator), schemaHooks.resolveQuery(botQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    get: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('bot', 'write')),
      schemaHooks.validateData(botDataValidator),
      schemaHooks.resolveData(botDataResolver),
      persistData,
      discard('botCommands')
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('bot', 'write')),
      schemaHooks.validateData(botPatchValidator),
      schemaHooks.resolveData(botPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('bot', 'write'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [addBotCommands],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
