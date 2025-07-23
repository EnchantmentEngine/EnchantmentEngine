import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ModerationAttachmentQuery,
  ModerationAttachmentsData,
  ModerationAttachmentsType
} from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
export interface ModerationAttachmentParams extends KnexAdapterParams<ModerationAttachmentQuery> {}

export class ModerationAttachmentService<
  T = ModerationAttachmentsType,
  ServiceParams extends Params = ModerationAttachmentParams
> extends KnexService<ModerationAttachmentsType, ModerationAttachmentsData> {}
