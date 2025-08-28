import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ChannelUserData,
  ChannelUserPatch,
  ChannelUserQuery,
  ChannelUserType
} from '@ir-engine/common/src/schemas/social/channel-user.schema'

export interface ChannelUserParams extends KnexAdapterParams<ChannelUserQuery> {}

export class ChannelUserService<
  T = ChannelUserType,
  ServiceParams extends Params = ChannelUserParams
> extends KnexService<ChannelUserType, ChannelUserData, ChannelUserParams, ChannelUserPatch> {}
