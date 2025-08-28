import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  matchUserDataSchema,
  matchUserPatchSchema,
  matchUserQuerySchema,
  matchUserSchema
} from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'

export default createSwaggerServiceOptions({
  schemas: {
    matchUserDataSchema,
    matchUserPatchSchema,
    matchUserQuerySchema,
    matchUserSchema
  },
  docs: {
    description: 'Match user service description',
    securities: ['all']
  }
})
