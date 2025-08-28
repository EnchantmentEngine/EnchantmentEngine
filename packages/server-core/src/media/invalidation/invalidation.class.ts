import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  InvalidationData,
  InvalidationQuery,
  InvalidationType
} from '@ir-engine/common/src/schemas/media/invalidation.schema'

export interface InvalidationParams extends KnexAdapterParams<InvalidationQuery> {}

export class InvalidationService<
  T = InvalidationType,
  ServiceParams extends Params = InvalidationParams
> extends KnexService<InvalidationType, InvalidationData, InvalidationParams> {}
