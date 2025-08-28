import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationTypeData,
  LocationTypePatch,
  LocationTypeQuery,
  LocationTypeType
} from '@ir-engine/common/src/schemas/social/location-type.schema'

export interface LocationTypeParams extends KnexAdapterParams<LocationTypeQuery> {}

export class LocationTypeService<
  T = LocationTypeType,
  ServiceParams extends Params = LocationTypeParams
> extends KnexService<LocationTypeType, LocationTypeData, LocationTypeParams, LocationTypePatch> {}
