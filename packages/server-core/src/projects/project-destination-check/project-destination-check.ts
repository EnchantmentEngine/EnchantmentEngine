import {
  projectDestinationCheckMethods,
  projectDestinationCheckPath
} from '@ir-engine/common/src/schemas/projects/project-destination-check.schema'

import { Application } from '../../../declarations'
import { ProjectDestinationCheckService } from './project-destination-check.class'
import projectDestinationCheckDocs from './project-destination-check.docs'
import hooks from './project-destination-check.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectDestinationCheckPath]: ProjectDestinationCheckService
  }
}

export default (app: Application): void => {
  app.use(projectDestinationCheckPath, new ProjectDestinationCheckService(app), {
    // A list of all methods this service exposes externally
    methods: projectDestinationCheckMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectDestinationCheckDocs
  })

  const service = app.service(projectDestinationCheckPath)
  service.hooks(hooks)
}
