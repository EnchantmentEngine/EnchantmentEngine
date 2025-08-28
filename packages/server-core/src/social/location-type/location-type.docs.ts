import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationTypeDataSchema,
  locationTypePatchSchema,
  locationTypeQuerySchema,
  locationTypeSchema
} from '@ir-engine/common/src/schemas/social/location-type.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationTypeDataSchema,
    locationTypePatchSchema,
    locationTypeQuerySchema,
    locationTypeSchema
  },
  docs: {
    description: 'Location type service description',
    securities: ['all']
  }
})
