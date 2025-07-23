import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ScopeTypeData,
  ScopeTypePatch,
  ScopeTypeQuery,
  ScopeTypeType
} from '@ir-engine/common/src/schemas/scope/scope-type.schema'

export interface ScopeTypeParams extends KnexAdapterParams<ScopeTypeQuery> {}

export class ScopeTypeService<T = ScopeTypeType, ServiceParams extends Params = ScopeTypeParams> extends KnexService<
  ScopeTypeType,
  ScopeTypeData,
  ScopeTypeParams,
  ScopeTypePatch
> {}
