import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  IdentityProviderData,
  IdentityProviderPatch,
  IdentityProviderQuery,
  IdentityProviderType
} from '@ir-engine/common/src/schemas/user/identity-provider.schema'

export interface IdentityProviderParams extends KnexAdapterParams<IdentityProviderQuery> {
  authentication?: any
}
export class IdentityProviderService<
  T = IdentityProviderType,
  ServiceParams extends Params = IdentityProviderParams
> extends KnexService<IdentityProviderType, IdentityProviderData, IdentityProviderParams, IdentityProviderPatch> {}
