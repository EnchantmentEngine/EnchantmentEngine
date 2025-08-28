// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectCheckUnfetchedCommitType } from '@ir-engine/common/src/schemas/projects/project-check-unfetched-commit.schema'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectCheckUnfetchedCommitResolver = resolve<ProjectCheckUnfetchedCommitType, HookContext>({})

export const projectCheckUnfetchedCommitExternalResolver = resolve<ProjectCheckUnfetchedCommitType, HookContext>({})
