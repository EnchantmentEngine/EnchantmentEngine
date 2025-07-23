import {
  instanceProvisionMethods,
  instanceProvisionPath
} from '@ir-engine/common/src/schemas/networking/instance-provision.schema'

import { Application } from '../../../declarations'
import { InstanceProvisionService } from './instance-provision.class'
import instanceProvisionDocs from './instance-provision.docs'
import hooks from './instance-provision.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceProvisionPath]: InstanceProvisionService
  }
}

export default (app: Application): void => {
  app.use(instanceProvisionPath, new InstanceProvisionService(app), {
    // A list of all methods this service exposes externally
    methods: instanceProvisionMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceProvisionDocs
  })

  const service = app.service(instanceProvisionPath)
  service.hooks(hooks)
}
