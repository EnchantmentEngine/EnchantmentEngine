import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userKickDataSchema,
  userKickPatchSchema,
  userKickQuerySchema,
  userKickSchema
} from '@ir-engine/common/src/schemas/user/user-kick.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userKickDataSchema,
    userKickPatchSchema,
    userKickQuerySchema,
    userKickSchema
  },
  docs: {
    description: 'User kick service description',
    securities: ['all']
  }
})
