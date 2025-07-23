import { logsApiMethods, logsApiPath } from '@ir-engine/common/src/schemas/cluster/logs-api.schema'

import { Application } from '../../../declarations'
import { LogsApiService } from './logs-api.class'
import logsApiDocs from './logs-api.docs'
import hooks from './logs-api.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [logsApiPath]: LogsApiService
  }
}

export default (app: Application): void => {
  app.use(logsApiPath, new LogsApiService(app), {
    // A list of all methods this service exposes externally
    methods: logsApiMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: logsApiDocs
  })

  const service = app.service(logsApiPath)
  service.hooks(hooks)
}
