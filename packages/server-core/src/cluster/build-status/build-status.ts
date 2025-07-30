import { buildStatusMethods, buildStatusPath } from '@ir-engine/common/src/schemas/cluster/build-status.schema'

import { Application } from '../../../declarations'
import { BuildStatusService } from './build-status.class'
import buildStatusDocs from './build-status.docs'
import hooks from './build-status.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [buildStatusPath]: BuildStatusService
  }
}

export default (app: Application): void => {
  const options = {
    name: buildStatusPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(buildStatusPath, new BuildStatusService(options), {
    // A list of all methods this service exposes externally
    methods: buildStatusMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: buildStatusDocs
  })

  const service = app.service(buildStatusPath)
  service.hooks(hooks)
}
