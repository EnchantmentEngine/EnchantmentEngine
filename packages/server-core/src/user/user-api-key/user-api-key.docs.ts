import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userApiKeyDataSchema,
  userApiKeyPatchSchema,
  userApiKeyQuerySchema,
  userApiKeySchema
} from '@ir-engine/common/src/schemas/user/user-api-key.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userApiKeyDataSchema,
    userApiKeyPatchSchema,
    userApiKeyQuerySchema,
    userApiKeySchema
  },
  docs: {
    description: 'User api key service description',
    securities: ['all']
  }
})
