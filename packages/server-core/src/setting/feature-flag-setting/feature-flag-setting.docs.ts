import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  featureFlagSettingDataSchema,
  featureFlagSettingPatchSchema,
  featureFlagSettingQuerySchema,
  featureFlagSettingSchema
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    featureFlagSettingDataSchema,
    featureFlagSettingPatchSchema,
    featureFlagSettingQuerySchema,
    featureFlagSettingSchema
  },
  docs: {
    description: 'Featre flag setting service description',
    securities: ['all']
  }
})
