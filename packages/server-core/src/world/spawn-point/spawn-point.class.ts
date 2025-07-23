import { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'

import {
  SpawnPointData,
  SpawnPointPatch,
  SpawnPointQuery,
  SpawnPointType
} from '@ir-engine/common/src/schemas/world/spawn-point.schema'

export interface SpawnPointParams extends Params<SpawnPointQuery> {
  paginate?: false
}

export class SpawnPointService<T = SpawnPointType, ServiceParams extends Params = SpawnPointParams> extends KnexService<
  SpawnPointType,
  SpawnPointData,
  SpawnPointParams,
  SpawnPointPatch
> {}
