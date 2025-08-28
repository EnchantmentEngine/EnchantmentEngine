import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userDataSchema,
  userPatchSchema,
  userQuerySchema,
  userSchema
} from '@ir-engine/common/src/schemas/user/user.schema'

export default createSwaggerServiceOptions({
  schemas: { userDataSchema, userPatchSchema, userQuerySchema, userSchema },
  docs: {
    description: 'User service description',
    securities: ['all']
  }
})
