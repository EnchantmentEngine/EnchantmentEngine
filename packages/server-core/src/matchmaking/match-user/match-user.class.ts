import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  MatchUserData,
  MatchUserPatch,
  MatchUserQuery,
  MatchUserType
} from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'

export interface MatchUserParams extends KnexAdapterParams<MatchUserQuery> {}

export class MatchUserService<T = MatchUserType, ServiceParams extends Params = MatchUserParams> extends KnexService<
  MatchUserType,
  MatchUserData,
  MatchUserParams,
  MatchUserPatch
> {}
