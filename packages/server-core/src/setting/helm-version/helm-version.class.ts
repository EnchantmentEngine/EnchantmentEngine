import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { HelmVersionQuery } from '@ir-engine/common/src/schemas/setting/helm-version.schema'
import { BaseService } from '@ir-engine/server-core/src/BaseService'

export interface HelmVersionParams extends KnexAdapterParams<HelmVersionQuery> {}

export class HelmVersionService<T = void, ServiceParams extends Params = HelmVersionParams> extends BaseService<
  string,
  void,
  HelmVersionParams,
  void
> {}
