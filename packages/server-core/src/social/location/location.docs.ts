import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationDataSchema,
  locationPatchSchema,
  locationQuerySchema,
  locationSchema
} from '@ir-engine/common/src/schemas/social/location.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationDataSchema,
    locationPatchSchema,
    locationQuerySchema,
    locationSchema
  },
  docs: {
    description: 'Location service description',
    securities: ['all']
  }
})
