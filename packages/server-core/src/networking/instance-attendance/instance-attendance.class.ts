import type { Params } from '@feathersjs/feathers'
import type { KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex'

import {
  InstanceAttendanceData,
  InstanceAttendancePatch,
  InstanceAttendanceQuery,
  InstanceAttendanceType
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'

export interface InstanceAttendanceParams extends KnexAdapterParams<InstanceAttendanceQuery> {}

export class InstanceAttendanceService<
  T = InstanceAttendanceType,
  ServiceParams extends Params = InstanceAttendanceParams
> extends KnexService<
  InstanceAttendanceType,
  InstanceAttendanceData,
  InstanceAttendanceParams,
  InstanceAttendancePatch
> {}
