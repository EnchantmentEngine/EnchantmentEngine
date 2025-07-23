import {
  featureFlagSettingMethods,
  featureFlagSettingPath
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'

import { Application } from '../../../declarations'
import { FeatureFlagSettingService } from './feature-flag-setting.class'
import featureFlagSettingDocs from './feature-flag-setting.docs'
import hooks from './feature-flag-setting.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [featureFlagSettingPath]: FeatureFlagSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: featureFlagSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(featureFlagSettingPath, new FeatureFlagSettingService(options), {
    // A list of all methods this service exposes externally
    methods: featureFlagSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: featureFlagSettingDocs
  })

  const service = app.service(featureFlagSettingPath)
  service.hooks(hooks)

  // todo, update state
  // service.on('patched', () => {
  //   updateAppConfig()
  // })
}
