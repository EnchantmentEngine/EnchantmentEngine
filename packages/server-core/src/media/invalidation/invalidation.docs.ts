import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  invalidationDataSchema,
  invalidationQuerySchema,
  invalidationSchema
} from '@ir-engine/common/src/schemas/media/invalidation.schema'

export default createSwaggerServiceOptions({
  schemas: {
    invalidationDataSchema,
    invalidationQuerySchema,
    invalidationSchema
  },
  docs: {
    description: 'Invalidation service description',
    securities: ['all']
  }
})
