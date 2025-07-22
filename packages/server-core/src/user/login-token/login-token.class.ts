import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LoginTokenData,
  LoginTokenPatch,
  LoginTokenQuery,
  LoginTokenType
} from '@ir-engine/common/src/schemas/user/login-token.schema'

export interface LoginTokenParams extends KnexAdapterParams<LoginTokenQuery> {}

/**
 * A class for LoginToken service
 */

export class LoginTokenService<T = LoginTokenType, ServiceParams extends Params = LoginTokenParams> extends KnexService<
  LoginTokenType,
  LoginTokenData,
  LoginTokenParams,
  LoginTokenPatch
> {}
