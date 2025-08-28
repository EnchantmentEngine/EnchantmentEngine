import { projectBuildMethods, projectBuildPath } from '@ir-engine/common/src/schemas/projects/project-build.schema'

import { Application } from '../../../declarations'
import { ProjectBuildService } from './project-build.class'
import projectBuildDocs from './project-build.docs'
import hooks from './project-build.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectBuildPath]: ProjectBuildService
  }
}

export default (app: Application): void => {
  app.use(projectBuildPath, new ProjectBuildService(app), {
    // A list of all methods this service exposes externally
    methods: projectBuildMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectBuildDocs
  })

  const service = app.service(projectBuildPath)
  service.hooks(hooks)
}
