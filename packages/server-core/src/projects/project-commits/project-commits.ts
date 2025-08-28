import {
  projectCommitsMethods,
  projectCommitsPath
} from '@ir-engine/common/src/schemas/projects/project-commits.schema'

import { Application } from '../../../declarations'
import { ProjectCommitsService } from './project-commits.class'
import projectCommitsDocs from './project-commits.docs'
import hooks from './project-commits.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectCommitsPath]: ProjectCommitsService
  }
}

export default (app: Application): void => {
  app.use(projectCommitsPath, new ProjectCommitsService(app), {
    // A list of all methods this service exposes externally
    methods: projectCommitsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectCommitsDocs
  })

  const service = app.service(projectCommitsPath)
  service.hooks(hooks)
}
