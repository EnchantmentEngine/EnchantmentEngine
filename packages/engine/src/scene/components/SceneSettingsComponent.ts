import { EntitySchema } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const DefaultKillHeight = -10

export const SceneSettingsComponent = defineComponent({
  name: 'SceneSettingsComponent',
  jsonID: 'EE_scene_settings',

  schema: Schema.Object({
    thumbnailURL: Schema.String(),
    loadingScreenURL: Schema.String(),
    primaryColor: Schema.String({ default: '#000000' }),
    backgroundColor: Schema.String({ default: '#FFFFFF' }),
    alternativeColor: Schema.String({ default: '#000000' }),
    sceneKillHeight: Schema.Number({ default: DefaultKillHeight }),
    spectateEntity: EntitySchema.EntityID()
  })
})
