// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectBuildPatch, ProjectBuildType } from '@ir-engine/common/src/schemas/projects/project-build.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectBuildResolver = resolve<ProjectBuildType, HookContext>({})

export const projectBuildExternalResolver = resolve<ProjectBuildType, HookContext>({})

export const projectBuildPatchResolver = resolve<ProjectBuildPatch, HookContext>({})
