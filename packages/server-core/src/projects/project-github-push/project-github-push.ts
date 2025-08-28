import {
  projectGithubPushMethods,
  projectGithubPushPath
} from '@ir-engine/common/src/schemas/projects/project-github-push.schema'

import { Application } from '../../../declarations'
import { ProjectGithubPushService } from './project-github-push.class'
import projectGithubPushDocs from './project-github-push.docs'
import hooks from './project-github-push.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectGithubPushPath]: ProjectGithubPushService
  }
}

export default (app: Application): void => {
  app.use(projectGithubPushPath, new ProjectGithubPushService(app), {
    // A list of all methods this service exposes externally
    methods: projectGithubPushMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectGithubPushDocs
  })

  const service = app.service(projectGithubPushPath)
  service.hooks(hooks)
}
