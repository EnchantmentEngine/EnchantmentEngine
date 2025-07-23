import { Params } from '@feathersjs/feathers'
import { UserApiKeyType } from '@ir-engine/common/src/schema.type.module'
import {
  ProjectPermissionQuery,
  projectPermissionPath
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import {
  ProjectSettingQuery,
  ProjectSettingType,
  projectSettingPath
} from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import { v4 } from 'uuid'
import { createUser, getAuthParams } from './user-test-utils'

export const createProject = async (app: Application, projectName?: string, user?: UserType) => {
  if (!projectName) {
    projectName = `__test/project-${v4()}`
  }

  if (!user) {
    user = await createUser(app)
  }

  const project = await app.service(projectPath).create(
    {
      name: projectName
    },
    {
      user
    }
  )

  return { project, user }
}

/**
 * Method to create permission on a project
 * @param app
 * @param type
 * @param projectId
 * @param user
 * @returns
 */
export const createProjectPermission = async (app: Application, type: string, projectId: string, user: UserType) => {
  const permission = await app.service(projectPermissionPath).create({
    type,
    projectId,
    userId: user.id
  })

  return permission
}

/**
 * Helper method used to remove project permission.
 * @param app
 * @param projectPermissionId
 * @param query
 * @returns
 */
export const removeProjectPermission = async (
  app: Application,
  projectPermissionId?: string,
  query?: ProjectPermissionQuery
) => {
  const projectPermission = await app.service(projectPermissionPath).remove(projectPermissionId ?? null, {
    query: {
      ...query
    }
  })

  return projectPermission
}

/**
 * Helper method used to create project setting. If params are not provided then it will create random ones.
 * @param app
 * @param key
 * @param value
 * @param user
 * @param project
 * @returns
 */
export const createProjectSetting = async (
  app: Application,
  key: string,
  value: string,
  type: ProjectSettingType['type'],
  user?: UserType,
  project?: ProjectType
) => {
  if (!project) {
    const projectResponse = await createProject(app, undefined, user)
    project = projectResponse.project
    user = projectResponse.user
  }

  if (!user) {
    user = await createUser(app)
  }

  const projectSetting = await app.service(projectSettingPath).create(
    {
      key,
      value,
      type,
      projectId: project!.id
    },
    {
      user
    }
  )

  return { projectSetting, project, user }
}

/**
 * Helper method used to get project setting.
 * @param app
 * @param projectSettingId
 * @returns
 */
// export const getProjectSetting = async (app: Application, projectSettingId: string) => {
//   const projectSetting = await app.service(projectSettingPath).get(projectSettingId)
//   return projectSetting
// }

/**
 * Helper method used to find project setting.
 * @param app
 * @param query
 * @param user
 * @returns
 */
export const findProjectSetting = async (app: Application, query: ProjectSettingQuery, userApiKey?: UserApiKeyType) => {
  let params: Params = {}

  if (userApiKey) {
    params = getAuthParams(userApiKey)
  }

  const projectSetting = await app.service(projectSettingPath).find({
    query: {
      ...query
    },
    ...params
  })
  return projectSetting
}

/**
 * Helper method used to patch project setting.
 * @param app
 * @param projectSettingId
 * @param projectSetting
 * @returns
 */
export const patchProjectSetting = async (
  app: Application,
  value: string,
  projectSettingId?: string,
  projectId?: string,
  key?: string
) => {
  const query = {} as ProjectSettingQuery

  if (projectId) {
    query.projectId = projectId
  }

  if (key) {
    query.key = key
  }

  const projectSetting = await app.service(projectSettingPath).patch(
    projectSettingId ?? null,
    {
      value
    },
    {
      query
    }
  )

  return projectSetting
}

/**
 * Helper method used to remove project setting.
 * @param app
 * @param projectSettingId
 * @param projectSetting
 * @returns
 */
export const removeProjectSetting = async (
  app: Application,
  projectSettingId?: string,
  query?: ProjectSettingQuery
) => {
  const projectSetting = await app.service(projectSettingPath).remove(projectSettingId ?? null, {
    query: {
      ...query
    }
  })
  return projectSetting
}
