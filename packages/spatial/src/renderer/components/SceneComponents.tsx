import { Color, CubeTexture, Fog, FogExp2, Texture } from 'three'

import { defineComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'

export const SceneComponent = defineComponent({
  name: 'SceneComponent'
})

export const BackgroundComponent = defineComponent({
  name: 'BackgroundComponent',
  schema: Schema.Type<Color | Texture | CubeTexture>()
})

export const EnvironmentMapComponent = defineComponent({
  name: 'EnvironmentMapComponent',
  schema: Schema.Type<Texture>()
})

export const FogComponent = defineComponent({
  name: 'FogComponent',
  schema: Schema.Type<Fog | FogExp2>()
})
