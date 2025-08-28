import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userRelationshipTypeDataSchema,
  userRelationshipTypePatchSchema,
  userRelationshipTypeQuerySchema,
  userRelationshipTypeSchema
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userRelationshipTypeDataSchema,
    userRelationshipTypePatchSchema,
    userRelationshipTypeQuerySchema,
    userRelationshipTypeSchema
  },
  docs: {
    description: 'User relationship type service description',
    securities: ['all']
  }
})
