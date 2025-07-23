import { allowedDomainsSchema } from '@ir-engine/common/src/schemas/networking/allowed-domains.schema'
import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {
    allowedDomainsSchema
  },
  docs: {
    description: 'Allowed-domain service description',
    securities: ['all']
  }
})
