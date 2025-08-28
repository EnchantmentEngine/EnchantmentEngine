import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationAdminDataSchema,
  locationAdminPatchSchema,
  locationAdminQuerySchema,
  locationAdminSchema
} from '@ir-engine/common/src/schemas/social/location-admin.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationAdminDataSchema,
    locationAdminPatchSchema,
    locationAdminQuerySchema,
    locationAdminSchema
  },
  docs: {
    description: 'Location admin service description',
    securities: ['all']
  }
})
