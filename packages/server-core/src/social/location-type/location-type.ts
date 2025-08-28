import { locationTypeMethods, locationTypePath } from '@ir-engine/common/src/schemas/social/location-type.schema'

import { Application } from '../../../declarations'
import { LocationTypeService } from './location-type.class'
import locationTypeDocs from './location-type.docs'
import hooks from './location-type.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationTypePath]: LocationTypeService
  }
}

export default (app: Application): void => {
  const options = {
    id: 'type',
    name: locationTypePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationTypePath, new LocationTypeService(options), {
    // A list of all methods this service exposes externally
    methods: locationTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationTypeDocs
  })

  const service = app.service(locationTypePath)
  service.hooks(hooks)
}
