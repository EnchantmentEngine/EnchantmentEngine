import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  moderationDataSchema,
  moderationPatchSchema,
  moderationQuerySchema,
  moderationSchema
} from '@ir-engine/common/src/schemas/moderation/moderation.schema'

export default createSwaggerServiceOptions({
  schemas: {
    moderationDataSchema: moderationDataSchema,
    moderationPatchSchema: moderationPatchSchema,
    moderationQuerySchema: moderationQuerySchema,
    moderationSchema: moderationSchema
  },
  docs: {
    description: 'Moderation service description',
    securities: ['all']
  }
})
