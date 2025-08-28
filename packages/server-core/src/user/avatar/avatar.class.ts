import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { AvatarData, AvatarPatch, AvatarQuery, AvatarType } from '@ir-engine/common/src/schemas/user/avatar.schema'

export interface AvatarParams extends KnexAdapterParams<AvatarQuery> {}

export class AvatarService<T = AvatarType, ServiceParams extends Params = AvatarParams> extends KnexService<
  AvatarType,
  AvatarData,
  AvatarParams,
  AvatarPatch
> {}
