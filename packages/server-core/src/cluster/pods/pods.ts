import { podsMethods, podsPath } from '@ir-engine/common/src/schemas/cluster/pods.schema'

import { Application } from '../../../declarations'
import { PodsService } from './pods.class'
import podsDocs from './pods.docs'
import hooks from './pods.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [podsPath]: PodsService
  }
}

export default (app: Application): void => {
  app.use(podsPath, new PodsService(app), {
    // A list of all methods this service exposes externally
    methods: podsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: podsDocs
  })

  const service = app.service(podsPath)
  service.hooks(hooks)
}
