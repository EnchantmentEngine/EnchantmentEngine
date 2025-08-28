import {
  githubRepoAccessWebhookMethods,
  githubRepoAccessWebhookPath
} from '@ir-engine/common/src/schemas/user/github-repo-access-webhook.schema'

import { Application } from '../../../declarations'
import { GithubRepoAccessWebhookService } from './github-repo-access-webhook.class'
import githubRepoAccessWebhookDocs from './github-repo-access-webhook.docs'
import hooks from './github-repo-access-webhook.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [githubRepoAccessWebhookPath]: GithubRepoAccessWebhookService
  }
}

export default (app: Application): void => {
  app.use(githubRepoAccessWebhookPath, new GithubRepoAccessWebhookService(app), {
    // A list of all methods this service exposes externally
    methods: githubRepoAccessWebhookMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: githubRepoAccessWebhookDocs
  })

  const service = app.service(githubRepoAccessWebhookPath)
  service.hooks(hooks)
}
