import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  generateTokenDataSchema,
  generateTokenPatchSchema,
  generateTokenQuerySchema,
  generateTokenSchema
} from '@ir-engine/common/src/schemas/user/generate-token.schema'

export default createSwaggerServiceOptions({
  schemas: {
    generateTokenDataSchema,
    generateTokenPatchSchema,
    generateTokenQuerySchema,
    generateTokenSchema
  },
  docs: {
    description: 'Generate Token service description',
    securities: ['all']
  }
})
