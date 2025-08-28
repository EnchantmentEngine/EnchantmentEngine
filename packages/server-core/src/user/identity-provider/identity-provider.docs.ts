import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  identityProviderDataSchema,
  identityProviderPatchSchema,
  identityProviderQuerySchema,
  identityProviderSchema
} from '@ir-engine/common/src/schemas/user/identity-provider.schema'

export default createSwaggerServiceOptions({
  schemas: {
    identityProviderDataSchema,
    identityProviderPatchSchema,
    identityProviderQuerySchema,
    identityProviderSchema
  },
  docs: {
    description: 'Identity provider service description',
    securities: ['all']
  }
})
