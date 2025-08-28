import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationAuthorizedUserDataSchema,
  locationAuthorizedUserPatchSchema,
  locationAuthorizedUserQuerySchema,
  locationAuthorizedUserSchema
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationAuthorizedUserDataSchema,
    locationAuthorizedUserPatchSchema,
    locationAuthorizedUserQuerySchema,
    locationAuthorizedUserSchema
  },
  docs: {
    description: 'Location authorized user service description',
    securities: ['all']
  }
})
