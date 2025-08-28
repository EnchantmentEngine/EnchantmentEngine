import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ChannelData,
  ChannelPatch,
  ChannelQuery,
  ChannelType
} from '@ir-engine/common/src/schemas/social/channel.schema'

export interface ChannelParams extends KnexAdapterParams<ChannelQuery> {}

export class ChannelService<T = ChannelType, ServiceParams extends Params = ChannelParams> extends KnexService<
  ChannelType,
  ChannelData,
  ChannelParams,
  ChannelPatch
> {}
