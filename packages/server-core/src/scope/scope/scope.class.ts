import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { ScopeData, ScopePatch, ScopeQuery, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'

export interface ScopeParams extends KnexAdapterParams<ScopeQuery> {}

/**
 * A class for Scope service
 */

export class ScopeService<T = ScopeTypeInterface, ServiceParams extends Params = ScopeParams> extends KnexService<
  ScopeTypeInterface,
  ScopeData,
  ScopeParams,
  ScopePatch
> {}
