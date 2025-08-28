import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  scopeTypeDataSchema,
  scopeTypePatchSchema,
  scopeTypeQuerySchema,
  scopeTypeSchema
} from '@ir-engine/common/src/schemas/scope/scope-type.schema'

export default createSwaggerServiceOptions({
  schemas: {
    scopeTypeDataSchema,
    scopeTypePatchSchema,
    scopeTypeQuerySchema,
    scopeTypeSchema
  },
  docs: {
    description: 'Scope type service description',
    securities: ['all']
  }
})
