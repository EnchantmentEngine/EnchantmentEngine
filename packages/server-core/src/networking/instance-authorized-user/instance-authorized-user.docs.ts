import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  instanceAuthorizedUserDataSchema,
  instanceAuthorizedUserPatchSchema,
  instanceAuthorizedUserQuerySchema,
  instanceAuthorizedUserSchema
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

export default createSwaggerServiceOptions({
  schemas: {
    instanceAuthorizedUserDataSchema,
    instanceAuthorizedUserPatchSchema,
    instanceAuthorizedUserQuerySchema,
    instanceAuthorizedUserSchema
  },
  docs: {
    description: 'Instance authorized user service description',
    securities: ['all']
  }
})
