import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  loginTokenDataSchema,
  loginTokenPatchSchema,
  loginTokenQuerySchema,
  loginTokenSchema
} from '@ir-engine/common/src/schemas/user/login-token.schema'

export default createSwaggerServiceOptions({
  schemas: {
    loginTokenDataSchema,
    loginTokenPatchSchema,
    loginTokenQuerySchema,
    loginTokenSchema
  },
  docs: {
    description: 'Login token service description',
    securities: ['all']
  }
})
