import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  UserRelationshipData,
  UserRelationshipPatch,
  UserRelationshipQuery,
  UserRelationshipType
} from '@ir-engine/common/src/schemas/user/user-relationship.schema'

export interface UserRelationshipParams extends KnexAdapterParams<UserRelationshipQuery> {}

/**
 * A class for User Relationship service
 */
export class UserRelationshipService<
  T = UserRelationshipType,
  ServiceParams extends Params = UserRelationshipParams
> extends KnexService<UserRelationshipType, UserRelationshipData, UserRelationshipParams, UserRelationshipPatch> {}
