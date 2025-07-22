import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationAuthorizedUserData,
  LocationAuthorizedUserPatch,
  LocationAuthorizedUserQuery,
  LocationAuthorizedUserType
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'

export interface LocationAuthorizedUserParams extends KnexAdapterParams<LocationAuthorizedUserQuery> {}

export class LocationAuthorizedUserService<
  T = LocationAuthorizedUserType,
  ServiceParams extends Params = LocationAuthorizedUserParams
> extends KnexService<
  LocationAuthorizedUserType,
  LocationAuthorizedUserData,
  LocationAuthorizedUserParams,
  LocationAuthorizedUserPatch
> {}
