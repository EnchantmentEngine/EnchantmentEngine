import { locationAdminMethods, locationAdminPath } from '@ir-engine/common/src/schemas/social/location-admin.schema'

// Initializes the `location-admin` service on path `/location-admin`
import { Application } from '../../../declarations'
import { LocationAdminService } from './location-admin.class'
import locationAdminDocs from './location-admin.docs'
import hooks from './location-admin.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationAdminPath]: LocationAdminService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationAdminPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationAdminPath, new LocationAdminService(options), {
    // A list of all methods this service exposes externally
    methods: locationAdminMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationAdminDocs
  })

  const service = app.service(locationAdminPath)
  service.hooks(hooks)
}
