// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { InviteTypeQuery, InviteTypeType } from '@ir-engine/common/src/schemas/social/invite-type.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const inviteTypeResolver = resolve<InviteTypeType, HookContext>({})

export const inviteTypeExternalResolver = resolve<InviteTypeType, HookContext>({})

export const inviteTypeDataResolver = resolve<InviteTypeType, HookContext>({})

export const inviteTypePatchResolver = resolve<InviteTypeType, HookContext>({})

export const inviteTypeQueryResolver = resolve<InviteTypeQuery, HookContext>({})
