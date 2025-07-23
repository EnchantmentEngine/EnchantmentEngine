// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { instanceAttendancePath } from '@ir-engine/common/src/schema.type.module'
import {
  InstanceAttendanceQuery,
  InstanceAttendanceType
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const instanceAttendanceResolver = resolve<InstanceAttendanceType, HookContext>({
  createdAt: virtual(async (instanceAttendance) => fromDateTimeSql(instanceAttendance.createdAt)),
  updatedAt: virtual(async (instanceAttendance) => fromDateTimeSql(instanceAttendance.updatedAt))
})

export const instanceAttendanceExternalResolver = resolve<InstanceAttendanceType, HookContext>({})

export const instanceAttendanceDataResolver = resolve<InstanceAttendanceType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  peerIndex: async (value, instanceAttendance, context) => {
    const peersInInstance = await context.app.service(instanceAttendancePath).find({
      query: {
        instanceId: instanceAttendance.instanceId
      }
    })
    // start at 1 because the first peer is the host
    return peersInInstance.total + 1
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const instanceAttendancePatchResolver = resolve<InstanceAttendanceType, HookContext>({
  updatedAt: getDateTimeSql
})

export const instanceAttendanceQueryResolver = resolve<InstanceAttendanceQuery, HookContext>({})
