import { WebRTCSettings } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import {
  engineSettingMethods,
  engineSettingPath,
  EngineSettingType
} from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { parseValue } from '@ir-engine/common/src/utils/dataTypeUtils'
import { unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { Application } from '@ir-engine/server-core/declarations'
import appConfig, { updateNestedConfig } from '../../appconfig'
import { EngineSettingService } from './engine-setting.class'
import engineSettingDocs from './engine-setting.docs'
import hooks from './engine-setting.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [engineSettingPath]: EngineSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: engineSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(engineSettingPath, new EngineSettingService(options), {
    // A list of all methods this service exposes externally
    methods: engineSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: engineSettingDocs
  })

  const service = app.service(engineSettingPath)
  service.hooks(hooks)

  const onUpdateAppConfig = (...args: EngineSettingType[]) => {
    args.forEach(async (setting) => {
      if (appConfig[setting.category]) {
        if (setting.key.includes('.')) {
          updateNestedConfig(appConfig, setting)
        } else {
          appConfig[setting.category][setting.key] = parseValue(setting.value, setting.dataType)
        }
      }
      const categoriesToUnflatten = ['email', 'aws', 'authentication', 'client']
      if (categoriesToUnflatten.includes(setting.category)) {
        const categorySettings = await service.find({
          query: {
            category: setting.category
          },
          paginate: false
        })

        appConfig[setting.category] = unflattenArrayToObject(
          categorySettings.map((setting) => {
            return {
              key: setting.key,
              value: setting.value,
              dataType: setting.dataType
            }
          })
        )
      }
      if (
        appConfig[setting.category] &&
        setting.category == 'instance-server-webrtc' &&
        setting.jsonKey &&
        setting.jsonKey == EngineSettings.InstanceServer.WebRTCSettings
      ) {
        const webRTCConfigSettings = await service.find({
          query: {
            category: setting.category,
            jsonKey: setting.jsonKey
          },
          paginate: false
        })

        appConfig[setting.category].webRTCSettings = unflattenArrayToObject(
          webRTCConfigSettings.map((setting) => {
            return {
              key: setting.key,
              value: setting.value,
              dataType: setting.dataType
            }
          })
        ) as WebRTCSettings
      }
    })
  }

  service.on('patched', onUpdateAppConfig)
  service.on('created', onUpdateAppConfig)
}
