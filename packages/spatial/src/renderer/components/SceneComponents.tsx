import { Color, CubeTexture, Fog, FogExp2, Texture } from 'three'

import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const SceneComponent = defineComponent({
  name: 'SceneComponent'
})

export const BackgroundComponent = defineComponent({
  name: 'BackgroundComponent',
  schema: S.Type<Color | Texture | CubeTexture>()
})

export const EnvironmentMapComponent = defineComponent({
  name: 'EnvironmentMapComponent',
  schema: S.Type<Texture>()
})

export const FogComponent = defineComponent({
  name: 'FogComponent',
  schema: S.Type<Fog | FogExp2>()
})
