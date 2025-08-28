import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  StaticResourceTagQuery,
  StaticResourceTagType
} from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'

export interface StaticResourceTagParams extends KnexAdapterParams<StaticResourceTagQuery> {}

export class StaticResourceTagService<
  T = StaticResourceTagType,
  ServiceParams extends Params = StaticResourceTagParams
> extends KnexService<StaticResourceTagType, any, StaticResourceTagParams, any> {}
