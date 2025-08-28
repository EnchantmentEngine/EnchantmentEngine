import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  StaticResourceData,
  StaticResourcePatch,
  StaticResourceQuery,
  StaticResourceType
} from '@ir-engine/common/src/schemas/media/static-resource.schema'

export interface StaticResourceParams extends KnexAdapterParams<StaticResourceQuery> {
  ignoreResourcesJson?: boolean
}

export class StaticResourceService<
  T = StaticResourceType,
  ServiceParams extends Params = StaticResourceParams
> extends KnexService<StaticResourceType, StaticResourceData, StaticResourceParams, StaticResourcePatch> {}
