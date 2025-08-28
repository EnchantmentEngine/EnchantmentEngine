import {
  metabaseUrlDataSchema,
  metabaseUrlQuerySchema
} from '@ir-engine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {
    metabaseUrlDataSchema,
    metabaseUrlQuerySchema
  },
  docs: {
    description: 'Metabase url service description',
    securities: ['all']
  }
})
