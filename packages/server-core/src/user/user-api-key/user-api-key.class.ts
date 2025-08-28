import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  UserApiKeyData,
  UserApiKeyPatch,
  UserApiKeyQuery,
  UserApiKeyType
} from '@ir-engine/common/src/schemas/user/user-api-key.schema'

export interface UserApiKeyParams extends KnexAdapterParams<UserApiKeyQuery> {}

export class UserApiKeyService<T = UserApiKeyType, ServiceParams extends Params = UserApiKeyParams> extends KnexService<
  UserApiKeyType,
  UserApiKeyData,
  UserApiKeyParams,
  UserApiKeyPatch
> {}
