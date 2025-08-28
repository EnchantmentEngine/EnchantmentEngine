import {
  projectPermissionMethods,
  projectPermissionPath
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'

import { Application } from '../../../declarations'
import { ProjectPermissionService } from './project-permission.class'
import projectPermissionDocs from './project-permission.docs'
import hooks from './project-permission.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectPermissionPath]: ProjectPermissionService
  }
}

export default (app: Application): void => {
  const options = {
    name: projectPermissionPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectPermissionPath, new ProjectPermissionService(options), {
    // A list of all methods this service exposes externally
    methods: projectPermissionMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectPermissionDocs
  })

  const service = app.service(projectPermissionPath)
  service.hooks(hooks)
}
