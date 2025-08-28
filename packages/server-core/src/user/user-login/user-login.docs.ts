import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userLoginDataSchema,
  userLoginPatchSchema,
  userLoginQuerySchema,
  userLoginSchema
} from '@ir-engine/common/src/schemas/user/user-login.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userLoginDataSchema,
    userLoginPatchSchema,
    userLoginQuerySchema,
    userLoginSchema
  },
  docs: {
    description: 'User login service description',
    securities: ['all']
  }
})
