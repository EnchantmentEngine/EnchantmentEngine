// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectDestinationCheckType } from '@ir-engine/common/src/schemas/projects/project-destination-check.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectDestinationCheckResolver = resolve<ProjectDestinationCheckType, HookContext>({})

export const projectDestinationCheckExternalResolver = resolve<ProjectDestinationCheckType, HookContext>({})
