import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationSettingDataSchema,
  locationSettingPatchSchema,
  locationSettingQuerySchema,
  locationSettingSchema
} from '@ir-engine/common/src/schemas/social/location-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationSettingDataSchema,
    locationSettingPatchSchema,
    locationSettingQuerySchema,
    locationSettingSchema
  },
  docs: {
    description: 'Location setting service description',
    securities: ['all']
  }
})
