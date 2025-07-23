import {
  StaticResourceType,
  staticResourceMethods,
  staticResourcePath
} from '@ir-engine/common/src/schemas/media/static-resource.schema'

import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { Channel } from '@feathersjs/transport-commons'
import {
  ScopeData,
  ScopeType,
  ScopeTypeInterface,
  UserID,
  projectPath,
  projectPermissionPath,
  scopePath
} from '@ir-engine/common/src/schema.type.module'
import _ from 'lodash'
import { Application } from '../../../declarations'
import { StaticResourceService } from './static-resource.class'
import staticResourceDocs from './static-resource.docs'
import hooks from './static-resource.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [staticResourcePath]: StaticResourceService
  }
}

export default (app: Application): void => {
  const options = {
    name: staticResourcePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(staticResourcePath, new StaticResourceService(options), {
    // A list of all methods this service exposes externally
    methods: staticResourceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: staticResourceDocs
  })

  const service = app.service(staticResourcePath)
  service.hooks(hooks)

  const onCRUD =
    (app: Application) => async (data: StaticResourceType | Paginated<StaticResourceType> | StaticResourceType[]) => {
      let userWithProjectReadScopes: (ScopeTypeInterface | ScopeData)[] = []

      const process = async (item: StaticResourceType, promises: Channel[]) => {
        // Only allow project scenes to be processed further
        if (!item.project || item.type !== 'scene') {
          return
        }

        // Populate user with project read scopes array if its not already populated
        if (userWithProjectReadScopes.length === 0) {
          userWithProjectReadScopes = await app.service(scopePath).find({
            query: {
              type: 'projects:read' as ScopeType
            },
            paginate: false
          })
        }

        // Get project id
        const project = await app.service(projectPath).find({
          query: {
            name: item.project,
            $select: ['id'],
            $limit: 1
          },
          paginate: false
        })

        if (project.length === 0) {
          throw new BadRequest(`Project not found. ${item.project}`)
        }

        // Get project owners from project-permission service
        const projectOwners = await app.service(projectPermissionPath).find({
          query: {
            projectId: project[0].id,
            type: 'owner'
          },
          paginate: false
        })

        const targetIds: string[] = []

        projectOwners.forEach((permission) => {
          targetIds.push(permission.userId)
        })

        userWithProjectReadScopes.forEach((scope) => {
          targetIds.push(scope.userId)
        })

        const uniqueUserIds = _.uniq(targetIds)

        // Publish to all users with project read scopes or project permission
        promises.push(...uniqueUserIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(item)))
      }

      const dataArr = Array.isArray(data) ? data : 'data' in data ? data.data : [data]

      const promises: Channel[] = []
      for (const item of dataArr) {
        await process(item, promises)
      }
      return promises
    }

  service.publish('created', onCRUD(app))
  service.publish('patched', onCRUD(app))
  service.publish('updated', onCRUD(app))
  service.publish('removed', onCRUD(app))
}
