import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  InstanceAuthorizedUserData,
  InstanceAuthorizedUserPatch,
  InstanceAuthorizedUserQuery,
  InstanceAuthorizedUserType
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

export interface InstanceAuthorizedUserParams extends KnexAdapterParams<InstanceAuthorizedUserQuery> {}

export class InstanceAuthorizedUserService<
  T = InstanceAuthorizedUserType,
  ServiceParams extends Params = InstanceAuthorizedUserParams
> extends KnexService<
  InstanceAuthorizedUserType,
  InstanceAuthorizedUserData,
  InstanceAuthorizedUserParams,
  InstanceAuthorizedUserPatch
> {}
