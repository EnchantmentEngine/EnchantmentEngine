// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { GenerateTokenQuery, GenerateTokenType } from '@ir-engine/common/src/schemas/user/generate-token.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const generateTokenResolver = resolve<GenerateTokenType, HookContext>({})

export const generateTokenExternalResolver = resolve<GenerateTokenType, HookContext>({})

export const generateTokenDataResolver = resolve<GenerateTokenType, HookContext>({})

export const generateTokenPatchResolver = resolve<GenerateTokenType, HookContext>({})

export const generateTokenQueryResolver = resolve<GenerateTokenQuery, HookContext>({})
