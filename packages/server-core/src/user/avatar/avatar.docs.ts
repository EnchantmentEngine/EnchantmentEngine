import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  avatarDataSchema,
  avatarPatchSchema,
  avatarQuerySchema,
  avatarSchema
} from '@ir-engine/common/src/schemas/user/avatar.schema'

export default createSwaggerServiceOptions({
  schemas: {
    avatarDataSchema,
    avatarPatchSchema,
    avatarQuerySchema,
    avatarSchema
  },
  docs: {
    description: 'Avatar service description',
    securities: ['all']
  }
})
