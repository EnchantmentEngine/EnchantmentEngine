import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  RecordingResourceData,
  RecordingResourcePatch,
  RecordingResourceQuery,
  RecordingResourceType
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'

export interface RecordingResourceParams extends KnexAdapterParams<RecordingResourceQuery> {}

export class RecordingResourceService<
  T = RecordingResourceType,
  ServiceParams extends Params = RecordingResourceParams
> extends KnexService<RecordingResourceType, RecordingResourceData, RecordingResourceParams, RecordingResourcePatch> {}
