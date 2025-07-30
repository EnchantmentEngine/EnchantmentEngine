import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  FeatureFlagSettingData,
  FeatureFlagSettingPatch,
  FeatureFlagSettingQuery,
  FeatureFlagSettingType
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'

export interface FeatureFlagSettingParams extends KnexAdapterParams<FeatureFlagSettingQuery> {}

export class FeatureFlagSettingService<
  T = FeatureFlagSettingType,
  ServiceParams extends Params = FeatureFlagSettingParams
> extends KnexService<
  FeatureFlagSettingType,
  FeatureFlagSettingData,
  FeatureFlagSettingParams,
  FeatureFlagSettingPatch
> {}
