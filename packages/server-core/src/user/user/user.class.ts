import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { UserData, UserPatch, UserQuery, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

export interface UserParams extends KnexAdapterParams<UserQuery> {}

/**
 * A class for User service
 */
export class UserService<T = UserType, ServiceParams extends Params = UserParams> extends KnexService<
  UserType,
  UserData,
  UserParams,
  UserPatch
> {}
