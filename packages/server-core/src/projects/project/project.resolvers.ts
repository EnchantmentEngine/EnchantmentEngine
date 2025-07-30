// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  projectPermissionPath,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { ProjectQuery, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { projectSettingPath } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const projectResolver = resolve<ProjectType, HookContext>({
  projectPermissions: virtual(async (project, context) => {
    return context.params.populateProjectPermissions
      ? ((await context.app.service(projectPermissionPath).find({
          query: {
            projectId: project.id
          },
          paginate: false
        })) as ProjectPermissionType[])
      : []
  }),

  settings: virtual(async (project, context) => {
    if (context.event !== 'removed') {
      return await context.app.service(projectSettingPath).find({
        query: {
          projectId: project.id
        },
        paginate: false
      })
    }
  }),

  assetsOnly: virtual(async (project, context) => {
    return !!project.assetsOnly
  }),

  hasLocalChanges: virtual(async (project, context) => {
    return !!project.hasLocalChanges
  }),

  needsRebuild: virtual(async (project, context) => {
    return !!project.needsRebuild
  }),

  commitDate: virtual(async (project) => {
    if (project.commitDate) return fromDateTimeSql(project.commitDate)
  }),
  createdAt: virtual(async (project) => fromDateTimeSql(project.createdAt)),
  updatedAt: virtual(async (project) => fromDateTimeSql(project.updatedAt))
})

export const projectExternalResolver = resolve<ProjectType, HookContext>({})

export const projectDataResolver = resolve<ProjectType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectPatchResolver = resolve<ProjectType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectQueryResolver = resolve<ProjectQuery, HookContext>({})
