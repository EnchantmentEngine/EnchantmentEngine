import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { BotData, BotPatch, BotQuery, BotType } from '@ir-engine/common/src/schemas/bot/bot.schema'

export interface BotParams extends KnexAdapterParams<BotQuery> {}

export class BotService<T = BotType, ServiceParams extends Params = BotParams> extends KnexService<
  BotType,
  BotData,
  BotParams,
  BotPatch
> {}
