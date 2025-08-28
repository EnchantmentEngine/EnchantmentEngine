// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { LocationTypeQuery, LocationTypeType } from '@ir-engine/common/src/schemas/social/location-type.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const locationTypeResolver = resolve<LocationTypeType, HookContext>({})

export const locationTypeExternalResolver = resolve<LocationTypeType, HookContext>({})

export const locationTypeDataResolver = resolve<LocationTypeType, HookContext>({})

export const locationTypePatchResolver = resolve<LocationTypeType, HookContext>({})

export const locationTypeQueryResolver = resolve<LocationTypeQuery, HookContext>({})
