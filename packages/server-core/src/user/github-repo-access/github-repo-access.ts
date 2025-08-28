import {
  githubRepoAccessMethods,
  githubRepoAccessPath
} from '@ir-engine/common/src/schemas/user/github-repo-access.schema'

import { Application } from '../../../declarations'
import { GithubRepoAccessService } from './github-repo-access.class'
import githubRepoAccessDocs from './github-repo-access.docs'
import hooks from './github-repo-access.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [githubRepoAccessPath]: GithubRepoAccessService
  }
}

export default (app: Application): void => {
  const options = {
    name: githubRepoAccessPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(githubRepoAccessPath, new GithubRepoAccessService(options), {
    // A list of all methods this service exposes externally
    methods: githubRepoAccessMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: githubRepoAccessDocs
  })

  const service = app.service(githubRepoAccessPath)
  service.hooks(hooks)
}
