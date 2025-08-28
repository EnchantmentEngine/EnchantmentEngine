import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  instanceDataSchema,
  instancePatchSchema,
  instanceQuerySchema,
  instanceSchema
} from '@ir-engine/common/src/schemas/networking/instance.schema'

export default createSwaggerServiceOptions({
  schemas: { instanceDataSchema, instancePatchSchema, instanceQuerySchema, instanceSchema },
  docs: {
    description: 'Instance service description',
    securities: ['all']
  }
})
