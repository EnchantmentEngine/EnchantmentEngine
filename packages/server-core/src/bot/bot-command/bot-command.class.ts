import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  BotCommandData,
  BotCommandPatch,
  BotCommandQuery,
  BotCommandType
} from '@ir-engine/common/src/schemas/bot/bot-command.schema'

export interface BotCommandParams extends KnexAdapterParams<BotCommandQuery> {}

export class BotCommandService<T = BotCommandType, ServiceParams extends Params = BotCommandParams> extends KnexService<
  BotCommandType,
  BotCommandData,
  BotCommandParams,
  BotCommandPatch
> {}
