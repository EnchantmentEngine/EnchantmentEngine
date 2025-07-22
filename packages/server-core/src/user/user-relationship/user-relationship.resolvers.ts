// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  UserRelationshipID,
  UserRelationshipQuery,
  UserRelationshipType
} from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const userRelationshipResolver = resolve<UserRelationshipType, HookContext>({
  createdAt: virtual(async (userRelationship) => fromDateTimeSql(userRelationship.createdAt)),
  updatedAt: virtual(async (userRelationship) => fromDateTimeSql(userRelationship.updatedAt))
})

export const userRelationshipExternalResolver = resolve<UserRelationshipType, HookContext>({
  user: virtual(async (userRelationship, context) => {
    if (userRelationship.userId) return await context.app.service(userPath).get(userRelationship.userId)
  }),
  relatedUser: virtual(async (userRelationship, context) => {
    if (userRelationship.relatedUserId) return await context.app.service(userPath).get(userRelationship.relatedUserId)
  })
})

export const userRelationshipDataResolver = resolve<UserRelationshipType, HookContext>({
  id: async () => {
    return uuidv4() as UserRelationshipID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userRelationshipPatchResolver = resolve<UserRelationshipType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userRelationshipQueryResolver = resolve<UserRelationshipQuery, HookContext>({})
