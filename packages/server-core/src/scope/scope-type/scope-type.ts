import { scopeTypeMethods, scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'

import { Application } from '../../../declarations'
import { ScopeTypeService } from './scope-type.class'
import scopeTypeDocs from './scope-type.docs'
import hooks from './scope-type.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [scopeTypePath]: ScopeTypeService
  }
}

export default (app: Application): void => {
  const options = {
    name: scopeTypePath,
    id: 'type',
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(scopeTypePath, new ScopeTypeService(options), {
    // A list of all methods this service exposes externally
    methods: scopeTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: scopeTypeDocs
  })

  const service = app.service(scopeTypePath)
  service.hooks(hooks)
}
