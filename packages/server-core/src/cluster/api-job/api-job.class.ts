import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { ApiJobData, ApiJobPatch, ApiJobQuery, ApiJobType } from '@ir-engine/common/src/schemas/cluster/api-job.schema'

export interface ApiJobParams extends KnexAdapterParams<ApiJobQuery> {}

export class ApiJobService<T = ApiJobType, ServiceParams extends Params = ApiJobParams> extends KnexService<
  ApiJobType,
  ApiJobData,
  ApiJobParams,
  ApiJobPatch
> {}
