import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  projectSettingDataSchema,
  projectSettingPatchSchema,
  projectSettingQuerySchema,
  projectSettingSchema
} from '@ir-engine/common/src/schemas/setting/project-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    projectSettingDataSchema,
    projectSettingPatchSchema,
    projectSettingQuerySchema,
    projectSettingSchema
  },
  docs: {
    description: 'Project setting service description',
    securities: ['all']
  }
})
