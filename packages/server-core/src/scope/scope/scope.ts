import { scopeMethods, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'

import { Application } from '../../../declarations'
import { ScopeService } from './scope.class'
import scopeDocs from './scope.docs'
import hooks from './scope.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [scopePath]: ScopeService
  }
}

export default (app: Application): void => {
  const options = {
    name: scopePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(scopePath, new ScopeService(options), {
    // A list of all methods this service exposes externally
    methods: scopeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: scopeDocs
  })

  const service = app.service(scopePath)
  service.hooks(hooks)
}
