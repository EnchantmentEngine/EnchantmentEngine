import {
  staticResourceVectorMethods,
  staticResourceVectorPath
} from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { Application } from '../../../declarations'
import { default as appConfig } from '../../appconfig'
import { StaticResourceVectorService } from './static-resource-vector.class'
import hooks from './static-resource-vector.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [staticResourceVectorPath]: StaticResourceVectorService
  }
}

export default (app: Application): void => {
  if (appConfig.vectordb.enabled) {
    const options = {
      name: staticResourceVectorPath,
      paginate: app.get('paginate'),
      Model: app.get('vectorDbClient'),
      multi: true
    }

    // Initialize our service with any options it requires
    app.use(staticResourceVectorPath, new StaticResourceVectorService(options, app), {
      // A list of all methods this service exposes externally
      methods: staticResourceVectorMethods,
      // You can add additional custom events to be sent to clients here
      events: []
    })

    // Initialize hooks
    app.service(staticResourceVectorPath).hooks(hooks)
  }
}
