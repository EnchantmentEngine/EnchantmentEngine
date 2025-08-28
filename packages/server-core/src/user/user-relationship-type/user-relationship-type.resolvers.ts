// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import {
  UserRelationshipTypeQuery,
  UserRelationshipTypeType
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const userRelationshipTypeResolver = resolve<UserRelationshipTypeType, HookContext>({})

export const userRelationshipTypeExternalResolver = resolve<UserRelationshipTypeType, HookContext>({})

export const userRelationshipTypeDataResolver = resolve<UserRelationshipTypeType, HookContext>({})

export const userRelationshipTypePatchResolver = resolve<UserRelationshipTypeType, HookContext>({})

export const userRelationshipTypeQueryResolver = resolve<UserRelationshipTypeQuery, HookContext>({})
