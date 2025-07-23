import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { GITHUB_URL_REGEX } from '@ir-engine/common/src/regex'
import {
  projectPermissionPath,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { projectPath, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { scopePath, ScopeType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../declarations'
import { checkUserRepoWriteStatus } from '../projects/project/github-helper'

export default (writeAccess) => {
  return async (context: HookContext<Application>) => {
    const { params, app } = context
    if (context.params.isInternal) return context
    const loggedInUser = params.user as UserType
    const isAdmin =
      (
        await app.service(scopePath).find({
          query: {
            userId: loggedInUser.id,
            type: 'admin:admin' as ScopeType
          }
        })
      ).data.length > 0
    if ((!writeAccess && isAdmin) || context.provider == null) return context
    let projectId, projectRepoPath
    const projectName = context.arguments[0]?.projectName || params.query?.projectName
    if (projectName) {
      const project = (await app.service(projectPath).find({
        query: {
          action: 'admin',
          name: projectName,
          $limit: 1
        }
      })) as Paginated<ProjectType>

      if (project.data.length > 0) {
        projectRepoPath = project.data[0].repositoryPath
        projectId = project.data[0].id
      } else throw new BadRequest('Invalid Project name')
    }
    if (!projectId) projectId = params.id || context.id
    // @ts-ignore
    const projectPermissionResult = (await app.service(projectPermissionPath).find({
      query: {
        projectId: projectId,
        userId: loggedInUser.id,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>
    if (projectPermissionResult == null) {
      const githubIdentityProvider = (await app.service(identityProviderPath).find({
        query: {
          userId: params.user.id,
          type: 'github',
          $limit: 1
        }
      })) as Paginated<IdentityProviderType>

      if (githubIdentityProvider.data.length === 0) throw new Forbidden('You are not authorized to access this project')
      const githubPathRegexExec = GITHUB_URL_REGEX.exec(projectRepoPath)
      if (!githubPathRegexExec) throw new BadRequest('Invalid project URL')
      const split = githubPathRegexExec[1].split('/')
      const owner = split[0]
      const repo = split[1]
      const userRepoWriteStatus = await checkUserRepoWriteStatus(
        owner,
        repo,
        githubIdentityProvider.data[0].oauthToken!,
        context.app
      )
      if (userRepoWriteStatus !== 200) throw new Forbidden('You are not authorized to access this project')
    }

    return context
  }
}
