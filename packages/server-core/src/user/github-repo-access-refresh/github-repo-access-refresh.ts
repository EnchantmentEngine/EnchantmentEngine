import {
  githubRepoAccessRefreshMethods,
  githubRepoAccessRefreshPath
} from '@ir-engine/common/src/schemas/user/github-repo-access-refresh.schema'

import { Application } from '../../../declarations'
import { GithubRepoAccessRefreshService } from './github-repo-access-refresh.class'
import githubRepoAccessRefreshDocs from './github-repo-access-refresh.docs'
import hooks from './github-repo-access-refresh.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [githubRepoAccessRefreshPath]: GithubRepoAccessRefreshService
  }
}

export default (app: Application): void => {
  app.use(githubRepoAccessRefreshPath, new GithubRepoAccessRefreshService(app), {
    // A list of all methods this service exposes externally
    methods: githubRepoAccessRefreshMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: githubRepoAccessRefreshDocs
  })

  const service = app.service(githubRepoAccessRefreshPath)
  service.hooks(hooks)
}
