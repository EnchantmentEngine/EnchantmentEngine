import {
  allowedDomainsMethods,
  allowedDomainsPath
} from '@ir-engine/common/src/schemas/networking/allowed-domains.schema'
import { Application } from '../../../declarations'
import { AllowedDomainsService } from './allowed-domains.class'
import allowedDomainsDocs from './allowed-domains.docs'
import hooks from './allowed-domains.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [allowedDomainsPath]: AllowedDomainsService
  }
}

export default (app: Application): void => {
  app.use(allowedDomainsPath, new AllowedDomainsService(), {
    // A list of all methods this service exposes externally
    methods: allowedDomainsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: allowedDomainsDocs
  })

  const service = app.service(allowedDomainsPath)
  service.hooks(hooks)
}
