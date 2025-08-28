import {
  staticResourceTagMethods,
  staticResourceTagPath
} from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'

import { Application } from '../../../declarations'
import { StaticResourceTagService } from './static-resource-tag.class'
import hooks from './static-resource-tag.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [staticResourceTagPath]: StaticResourceTagService
  }
}

export default (app: Application): void => {
  const options = {
    name: staticResourceTagPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: false
  }

  app.use(staticResourceTagPath, new StaticResourceTagService(options), {
    methods: staticResourceTagMethods,
    events: []
  })

  const service = app.service(staticResourceTagPath)
  service.hooks(hooks)
}
