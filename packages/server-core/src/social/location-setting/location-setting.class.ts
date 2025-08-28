import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationSettingData,
  LocationSettingPatch,
  LocationSettingQuery,
  LocationSettingType
} from '@ir-engine/common/src/schemas/social/location-setting.schema'

export interface LocationSettingParams extends KnexAdapterParams<LocationSettingQuery> {}

export class LocationSettingService<
  T = LocationSettingType,
  ServiceParams extends Params = LocationSettingParams
> extends KnexService<LocationSettingType, LocationSettingData, LocationSettingParams, LocationSettingPatch> {}
