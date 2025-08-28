// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'

import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'
import {
  InviteCodeLookupQuery,
  InviteCodeLookupType
} from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const inviteCodeLookupResolver = resolve<InviteCodeLookupType, HookContext>({
  instanceAttendance: virtual(async (inviteCodeLookup, context) => {
    if (context.params.user?.id === context.id)
      return (await context.app.service(instanceAttendancePath).find({
        query: {
          userId: inviteCodeLookup.id,
          ended: false
        },
        paginate: false
      })) as InstanceAttendanceType[]

    return []
  })
})

export const inviteCodeLookupExternalResolver = resolve<InviteCodeLookupType, HookContext>({})

export const inviteCodeLookupQueryResolver = resolve<InviteCodeLookupQuery, HookContext>({})
