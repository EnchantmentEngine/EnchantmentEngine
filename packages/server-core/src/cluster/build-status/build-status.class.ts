import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  BuildStatusData,
  BuildStatusPatch,
  BuildStatusQuery,
  BuildStatusType
} from '@ir-engine/common/src/schemas/cluster/build-status.schema'

export interface BuildStatusParams extends KnexAdapterParams<BuildStatusQuery> {}

export class BuildStatusService<
  T = BuildStatusType,
  ServiceParams extends Params = BuildStatusParams
> extends KnexService<BuildStatusType, BuildStatusData, BuildStatusParams, BuildStatusPatch> {}
