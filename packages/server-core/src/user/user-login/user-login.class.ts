import type { Params } from '@feathersjs/feathers'
import type { KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex'

import {
  UserLoginData,
  UserLoginPatch,
  UserLoginQuery,
  UserLoginType
} from '@ir-engine/common/src/schemas/user/user-login.schema'

export interface UserLoginParams extends KnexAdapterParams<UserLoginQuery> {}

export class UserLoginService<T = UserLoginType, ServiceParams extends Params = UserLoginParams> extends KnexService<
  UserLoginType,
  UserLoginData,
  UserLoginParams,
  UserLoginPatch
> {}
