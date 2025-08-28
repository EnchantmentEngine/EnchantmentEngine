import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  instanceAttendanceDataSchema,
  instanceAttendancePatchSchema,
  instanceAttendanceQuerySchema,
  instanceAttendanceSchema
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'

export default createSwaggerServiceOptions({
  schemas: {
    instanceAttendanceDataSchema,
    instanceAttendancePatchSchema,
    instanceAttendanceQuerySchema,
    instanceAttendanceSchema
  },
  docs: {
    description: 'Instance attendance service description',
    securities: ['all']
  }
})
