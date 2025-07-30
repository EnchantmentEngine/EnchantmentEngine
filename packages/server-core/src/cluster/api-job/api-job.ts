import { apiJobMethods, apiJobPath } from '@ir-engine/common/src/schemas/cluster/api-job.schema'

import { Application } from '../../../declarations'
import { ApiJobService } from './api-job.class'
import apiJobDocs from './api-job.docs'
import hooks from './api-job.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [apiJobPath]: ApiJobService
  }
}

export default (app: Application): void => {
  const options = {
    name: apiJobPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(apiJobPath, new ApiJobService(options), {
    // A list of all methods this service exposes externally
    methods: apiJobMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: apiJobDocs
  })

  const service = app.service(apiJobPath)
  service.hooks(hooks)
}
