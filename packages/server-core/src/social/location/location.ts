import { locationMethods, locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

import { Application, HookContext } from '../../../declarations'
import config from '../../appconfig'
import { LocationService } from './location.class'
import locationDocs from './location.docs'
import hooks from './location.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationPath]: LocationService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationPath, new LocationService(options), {
    // A list of all methods this service exposes externally
    methods: locationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationDocs
  })

  const service = app.service(locationPath)
  service.hooks(hooks)

  config.authentication.whiteList.push({
    path: locationPath,
    methods: {
      find: async (context: HookContext) => {
        // ensure that we are only allowing unauthenticated requests for a very specific query
        if (
          context.params.query?.action === 'viewer' &&
          context.params.query?.slugifiedName &&
          context.params.query?.slugifiedName !== '' &&
          Object.keys(context.params.query).length === 2
        ) {
          delete context.params.query.action
          return true
        }

        // force authentication for all other situations
        return false
      }
    }
  })
}
