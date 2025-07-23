import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  InviteTypeData,
  InviteTypePatch,
  InviteTypeQuery,
  InviteTypeType
} from '@ir-engine/common/src/schemas/social/invite-type.schema'

export interface InviteTypeParams extends KnexAdapterParams<InviteTypeQuery> {}

export class InviteTypeService<T = InviteTypeType, ServiceParams extends Params = InviteTypeParams> extends KnexService<
  InviteTypeType,
  InviteTypeData,
  InviteTypeParams,
  InviteTypePatch
> {}
