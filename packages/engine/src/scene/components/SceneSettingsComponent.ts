import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const DefaultKillHeight = -10

export const SceneSettingsComponent = defineComponent({
  name: 'SceneSettingsComponent',
  jsonID: 'EE_scene_settings',

  schema: S.Object({
    thumbnailURL: S.String(),
    loadingScreenURL: S.String(),
    primaryColor: S.String({ default: '#000000' }),
    backgroundColor: S.String({ default: '#FFFFFF' }),
    alternativeColor: S.String({ default: '#000000' }),
    sceneKillHeight: S.Number({ default: DefaultKillHeight }),
    spectateEntity: S.EntityID()
  })
})
