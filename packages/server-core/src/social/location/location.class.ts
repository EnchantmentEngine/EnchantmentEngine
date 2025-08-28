import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationData,
  LocationPatch,
  LocationQuery,
  LocationType
} from '@ir-engine/common/src/schemas/social/location.schema'

export interface LocationParams extends KnexAdapterParams<LocationQuery> {}

export class LocationService<T = LocationType, ServiceParams extends Params = LocationParams> extends KnexService<
  LocationType,
  LocationData,
  LocationParams,
  LocationPatch
> {}
