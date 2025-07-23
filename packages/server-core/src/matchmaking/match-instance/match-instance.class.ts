import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  MatchInstanceData,
  MatchInstancePatch,
  MatchInstanceQuery,
  MatchInstanceType
} from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'

export interface MatchInstanceParams extends KnexAdapterParams<MatchInstanceQuery> {}

export class MatchInstanceService<
  T = MatchInstanceType,
  ServiceParams extends Params = MatchInstanceParams
> extends KnexService<MatchInstanceType, MatchInstanceData, MatchInstanceParams, MatchInstancePatch> {}
