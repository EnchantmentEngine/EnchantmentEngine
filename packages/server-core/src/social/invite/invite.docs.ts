import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  inviteDataSchema,
  invitePatchSchema,
  inviteQuerySchema,
  inviteSchema
} from '@ir-engine/common/src/schemas/social/invite.schema'

export default createSwaggerServiceOptions({
  schemas: {
    inviteDataSchema,
    invitePatchSchema,
    inviteQuerySchema,
    inviteSchema
  },
  docs: {
    description: 'Invite service description',
    securities: ['all']
  }
})
