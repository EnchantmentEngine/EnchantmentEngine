import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  UserRelationshipTypeData,
  UserRelationshipTypePatch,
  UserRelationshipTypeQuery,
  UserRelationshipTypeType
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'

export interface UserRelationshipTypeParams extends KnexAdapterParams<UserRelationshipTypeQuery> {}

export class UserRelationshipTypeService<
  T = UserRelationshipTypeType,
  ServiceParams extends Params = UserRelationshipTypeParams
> extends KnexService<
  UserRelationshipTypeType,
  UserRelationshipTypeData,
  UserRelationshipTypeParams,
  UserRelationshipTypePatch
> {}
