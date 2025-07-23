import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { RouteData, RoutePatch, RouteQuery, RouteType } from '@ir-engine/common/src/schemas/route/route.schema'

export interface RouteParams extends KnexAdapterParams<RouteQuery> {}

export class RouteService<T = RouteType, ServiceParams extends Params = RouteParams> extends KnexService<
  RouteType,
  RouteData,
  RouteParams,
  RoutePatch
> {}
