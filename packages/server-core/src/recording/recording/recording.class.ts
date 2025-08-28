import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  RecordingData,
  RecordingPatch,
  RecordingQuery,
  RecordingType
} from '@ir-engine/common/src/schemas/recording/recording.schema'

export interface RecordingParams extends KnexAdapterParams<RecordingQuery> {}

export class RecordingService<T = RecordingType, ServiceParams extends Params = RecordingParams> extends KnexService<
  RecordingType,
  RecordingData,
  RecordingParams,
  RecordingPatch
> {}
