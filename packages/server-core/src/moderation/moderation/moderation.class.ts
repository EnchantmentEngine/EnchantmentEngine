import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ModerationData,
  ModerationPatch,
  ModerationQuery,
  ModerationType
} from '@ir-engine/common/src/schemas/moderation/moderation.schema'

export interface ModerationParams extends KnexAdapterParams<ModerationQuery> {}

export class ModerationService<T = ModerationType, ServiceParams extends Params = ModerationParams> extends KnexService<
  ModerationType,
  ModerationData,
  ModerationParams,
  ModerationPatch
> {}
