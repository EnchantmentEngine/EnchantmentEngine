import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  inviteTypeDataSchema,
  inviteTypePatchSchema,
  inviteTypeQuerySchema,
  inviteTypeSchema
} from '@ir-engine/common/src/schemas/social/invite-type.schema'

export default createSwaggerServiceOptions({
  schemas: {
    inviteTypeDataSchema,
    inviteTypePatchSchema,
    inviteTypeQuerySchema,
    inviteTypeSchema
  },
  docs: {
    description: 'Invite type service description',
    securities: ['all']
  }
})
