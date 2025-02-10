import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'
import {
  ModerationBanData,
  ModerationBanPatch,
  ModerationBanQuery,
  ModerationBanType
} from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'

export interface ModerationBanParams extends KnexAdapterParams<ModerationBanQuery> {}

export class ModerationBanService<
  T = ModerationBanType,
  ServiceParams extends Params = ModerationBanParams
> extends KnexService<ModerationBanType, ModerationBanData, ModerationBanParams, ModerationBanPatch> {}
