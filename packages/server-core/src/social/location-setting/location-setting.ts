import {
  locationSettingMethods,
  locationSettingPath
} from '@ir-engine/common/src/schemas/social/location-setting.schema'

import { Application } from '../../../declarations'
import { LocationSettingService } from './location-setting.class'
import locationSettingDocs from './location-setting.docs'
import hooks from './location-setting.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationSettingPath]: LocationSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationSettingPath, new LocationSettingService(options), {
    // A list of all methods this service exposes externally
    methods: locationSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationSettingDocs
  })

  const service = app.service(locationSettingPath)
  service.hooks(hooks)
}
