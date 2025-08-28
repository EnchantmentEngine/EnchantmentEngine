import { helmVersionQuerySchema } from '@ir-engine/common/src/schemas/setting/helm-version.schema'
import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {
    helmVersionQuerySchema
  },
  docs: {
    description: 'Helm version service description',
    securities: ['all']
  }
})
