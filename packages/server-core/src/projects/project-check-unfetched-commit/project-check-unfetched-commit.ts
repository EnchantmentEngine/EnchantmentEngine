import {
  projectCheckUnfetchedCommitMethods,
  projectCheckUnfetchedCommitPath
} from '@ir-engine/common/src/schemas/projects/project-check-unfetched-commit.schema'

import { Application } from '../../../declarations'
import { ProjectCheckUnfetchedCommitService } from './project-check-unfetched-commit.class'
import projectCheckUnfetchedCommitDocs from './project-check-unfetched-commit.docs'
import hooks from './project-check-unfetched-commit.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectCheckUnfetchedCommitPath]: ProjectCheckUnfetchedCommitService
  }
}

export default (app: Application): void => {
  app.use(projectCheckUnfetchedCommitPath, new ProjectCheckUnfetchedCommitService(app), {
    // A list of all methods this service exposes externally
    methods: projectCheckUnfetchedCommitMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectCheckUnfetchedCommitDocs
  })

  const service = app.service(projectCheckUnfetchedCommitPath)
  service.hooks(hooks)
}
