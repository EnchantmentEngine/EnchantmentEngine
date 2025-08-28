import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userRelationshipDataSchema,
  userRelationshipPatchSchema,
  userRelationshipQuerySchema,
  userRelationshipSchema
} from '@ir-engine/common/src/schemas/user/user-relationship.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userRelationshipDataSchema,
    userRelationshipPatchSchema,
    userRelationshipQuerySchema,
    userRelationshipSchema
  },
  docs: {
    description: 'User relationship service description',
    securities: ['all']
  }
})
