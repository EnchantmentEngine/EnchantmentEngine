import { projectsMethods, projectsPath } from '@ir-engine/common/src/schemas/projects/projects.schema'

import { Application } from '../../../declarations'
import { ProjectsService } from './projects.class'
import projectsDocs from './projects.docs'
import hooks from './projects.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectsPath]: ProjectsService
  }
}

export default (app: Application): void => {
  app.use(projectsPath, new ProjectsService(app), {
    // A list of all methods this service exposes externally
    methods: projectsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectsDocs
  })

  const service = app.service(projectsPath)
  service.hooks(hooks)
}
