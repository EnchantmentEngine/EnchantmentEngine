import {
  projectCheckSourceDestinationMatchMethods,
  projectCheckSourceDestinationMatchPath
} from '@ir-engine/common/src/schemas/projects/project-check-source-destination-match.schema'

import { Application } from '../../../declarations'
import { ProjectCheckSourceDestinationMatchService } from './project-check-source-destination-match.class'
import projectCheckSourceDestinationMatchDocs from './project-check-source-destination-match.docs'
import hooks from './project-check-source-destination-match.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectCheckSourceDestinationMatchPath]: ProjectCheckSourceDestinationMatchService
  }
}

export default (app: Application): void => {
  app.use(projectCheckSourceDestinationMatchPath, new ProjectCheckSourceDestinationMatchService(app), {
    // A list of all methods this service exposes externally
    methods: projectCheckSourceDestinationMatchMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectCheckSourceDestinationMatchDocs
  })

  const service = app.service(projectCheckSourceDestinationMatchPath)
  service.hooks(hooks)
}
