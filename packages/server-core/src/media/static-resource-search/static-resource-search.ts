import {
  staticResourceSearchMethods,
  staticResourceSearchPath
} from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { Application } from '../../../declarations'
import { default as appConfig } from '../../appconfig'
import { StaticResourceSearchService } from './static-resource-search.class'
import hooks from './static-resource-search.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [staticResourceSearchPath]: StaticResourceSearchService
  }
}

export default (app: Application): void => {
  if (appConfig.vectordb.enabled) {
    // Initialize our service
    app.use(staticResourceSearchPath, new StaticResourceSearchService(app), {
      // Only expose the find method
      methods: staticResourceSearchMethods,
      // Custom events for search analytics
      events: ['search-performed']
    })

    // Initialize hooks
    app.service(staticResourceSearchPath).hooks(hooks)
  }
}
