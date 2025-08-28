import {
  locationAuthorizedUserMethods,
  locationAuthorizedUserPath
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'

import { Application } from '../../../declarations'
import { LocationAuthorizedUserService } from './location-authorized-user.class'
import locationBanDocs from './location-authorized-user.docs'
import hooks from './location-authorized-user.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationAuthorizedUserPath]: LocationAuthorizedUserService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationAuthorizedUserPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationAuthorizedUserPath, new LocationAuthorizedUserService(options), {
    // A list of all methods this service exposes externally
    methods: locationAuthorizedUserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationBanDocs
  })

  const service = app.service(locationAuthorizedUserPath)
  service.hooks(hooks)
}
