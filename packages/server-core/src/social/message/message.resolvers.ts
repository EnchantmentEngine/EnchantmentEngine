// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { MessageID, MessageQuery, MessageType } from '@ir-engine/common/src/schemas/social/message.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const messageResolver = resolve<MessageType, HookContext>({
  createdAt: virtual(async (message) => fromDateTimeSql(message.createdAt)),
  updatedAt: virtual(async (message) => fromDateTimeSql(message.updatedAt))
})

export const messageExternalResolver = resolve<MessageType, HookContext>({
  sender: virtual(async (message, context) => {
    if (message.senderId) {
      return await context.app.service(userPath).get(message.senderId)
    }
  })
})

export const messageDataResolver = resolve<MessageType, HookContext>({
  id: async () => {
    return uuidv4() as MessageID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const messagePatchResolver = resolve<MessageType, HookContext>({
  updatedAt: getDateTimeSql
})

export const messageQueryResolver = resolve<MessageQuery, HookContext>({})
