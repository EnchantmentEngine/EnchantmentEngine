import type { Params } from '@feathersjs/feathers'
import type { KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex'

import {
  UserKickData,
  UserKickPatch,
  UserKickQuery,
  UserKickType
} from '@ir-engine/common/src/schemas/user/user-kick.schema'

export interface UserKickParams extends KnexAdapterParams<UserKickQuery> {}

export class UserKickService<T = UserKickType, ServiceParams extends Params = UserKickParams> extends KnexService<
  UserKickType,
  UserKickData,
  UserKickParams,
  UserKickPatch
> {}
