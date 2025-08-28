import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  migrationsInfoQuerySchema,
  migrationsInfoSchema
} from '@ir-engine/common/src/schemas/cluster/migrations-info.schema'

export default createSwaggerServiceOptions({
  schemas: {
    migrationsInfoQuerySchema,
    migrationsInfoSchema
  },
  docs: {
    description: 'Migrations info service description',
    securities: ['all']
  }
})
