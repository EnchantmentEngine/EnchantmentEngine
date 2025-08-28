import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  moderationBanDataSchema,
  moderationBanPatchSchema,
  moderationBanQuerySchema,
  moderationBanSchema
} from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'

export default createSwaggerServiceOptions({
  schemas: {
    moderationBanDataSchema: moderationBanDataSchema,
    moderationBanPatchSchema: moderationBanPatchSchema,
    moderationBanQuerySchema: moderationBanQuerySchema,
    moderatBanionSchema: moderationBanSchema
  },
  docs: {
    description: 'Moderation ban service description',
    securities: ['all']
  }
})
