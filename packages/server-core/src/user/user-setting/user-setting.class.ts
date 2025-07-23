import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  UserSettingData,
  UserSettingPatch,
  UserSettingQuery,
  UserSettingType
} from '@ir-engine/common/src/schemas/user/user-setting.schema'

export interface UserSettingParams extends KnexAdapterParams<UserSettingQuery> {}

export class UserSettingService<
  T = UserSettingType,
  ServiceParams extends Params = UserSettingParams
> extends KnexService<UserSettingType, UserSettingData, UserSettingParams, UserSettingPatch> {}
