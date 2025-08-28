import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { InviteData, InvitePatch, InviteQuery, InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'

export interface InviteParams extends KnexAdapterParams<InviteQuery> {
  preventUserRelationshipRemoval?: boolean
}

export class InviteService<T = InviteType, ServiceParams extends Params = InviteParams> extends KnexService<
  InviteType,
  InviteData,
  InviteParams,
  InvitePatch
> {}
