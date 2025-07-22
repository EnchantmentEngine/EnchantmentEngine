import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'
import {
  EngineSettingData,
  EngineSettingPatch,
  EngineSettingQuery,
  EngineSettingType
} from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { Application } from '@ir-engine/server-core/declarations'

export interface EngineSettingParams extends KnexAdapterParams<EngineSettingQuery> {}

export class EngineSettingService<
  T = EngineSettingType,
  ServiceParams extends Params = EngineSettingParams
> extends KnexService<EngineSettingType, EngineSettingData, EngineSettingParams, EngineSettingPatch> {
  app: Application
}
