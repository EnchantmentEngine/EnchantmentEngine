import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userSettingDataSchema,
  userSettingPatchSchema,
  userSettingQuerySchema,
  userSettingSchema
} from '@ir-engine/common/src/schemas/user/user-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userSettingDataSchema,
    userSettingPatchSchema,
    userSettingQuerySchema,
    userSettingSchema
  },
  docs: {
    description: 'User setting service description',
    securities: ['all']
  }
})
