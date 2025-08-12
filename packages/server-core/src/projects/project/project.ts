import _ from 'lodash-es'

import logger from '@ir-engine/common/src/logger'
import { projectPermissionPath } from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { projectMethods, projectPath, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import { ProjectService } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectPath]: ProjectService
  }
}

export default (app: Application): void => {
  const options = {
    name: projectPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectPath, new ProjectService(options, app), {
    // A list of all methods this service exposes externally
    methods: projectMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectDocs
  })

  const service = app.service(projectPath)
  service.hooks(hooks)

  service.publish('patched', async (data: ProjectType) => {
    try {
      const targetIds: string[] = []
      const projectOwners = await app.service(projectPermissionPath).find({
        query: {
          projectId: data.id,
          type: 'owner'
        },
        paginate: false
      })
      projectOwners.forEach((permission) => {
        targetIds.push(permission.userId)
      })

      const projectReadScopes = await app.service(scopePath).find({
        query: {
          type: 'projects:read' as ScopeType
        },
        paginate: false
      })
      projectReadScopes.forEach((scope) => {
        targetIds.push(scope.userId)
      })

      const uniqueUserIds = _.uniq(targetIds)
      return Promise.all(uniqueUserIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
