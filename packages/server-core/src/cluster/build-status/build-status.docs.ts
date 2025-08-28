import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  buildStatusDataSchema,
  buildStatusPatchSchema,
  buildStatusQuerySchema,
  buildStatusSchema
} from '@ir-engine/common/src/schemas/cluster/build-status.schema'

export default createSwaggerServiceOptions({
  schemas: {
    buildStatusDataSchema,
    buildStatusPatchSchema,
    buildStatusQuerySchema,
    buildStatusSchema
  },
  docs: {
    description: 'Build status service description',
    securities: ['all']
  }
})
