import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationAdminData,
  LocationAdminPatch,
  LocationAdminQuery,
  LocationAdminType
} from '@ir-engine/common/src/schemas/social/location-admin.schema'

export interface LocationAdminParams extends KnexAdapterParams<LocationAdminQuery> {}

export class LocationAdminService<
  T = LocationAdminType,
  ServiceParams extends Params = LocationAdminParams
> extends KnexService<LocationAdminType, LocationAdminData, LocationAdminParams, LocationAdminPatch> {}
