import { useEffect } from 'react'
import { Fog, FogExp2 } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { Schema } from '@ir-engine/hyperflux'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from './FogShaders'
import { FogComponent } from './SceneComponents'
import { VisibleComponent } from './VisibleComponent'

export const FogType = {
  Disabled: 'disabled',
  Linear: 'linear',
  Exponential: 'exponential',
  Brownian: 'brownian',
  Height: 'height'
} as const

export type FogType = (typeof FogType)[keyof typeof FogType]

export const FogSettingsComponent = defineComponent({
  name: 'FogSettingsComponent',
  jsonID: 'EE_fog',

  schema: Schema.Object({
    type: Schema.Enum(FogType, {
      $comment:
        "A string enum, ie. one of the following values: 'disabled', 'linear', 'exponential', 'brownian', 'height'",
      default: FogType.Disabled
    }),
    color: Schema.String({ default: '#FFFFFF' }),
    density: Schema.Number({ default: 0.005 }),
    near: Schema.Number({ default: 1 }),
    far: Schema.Number({ default: 1000 }),
    timeScale: Schema.Number({ default: 1 }),
    height: Schema.Number({ default: 0.05 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const fog = useComponent(entity, FogSettingsComponent)
    const isVisible = useHasComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!isVisible) return

      switch (fog.type) {
        case FogType.Linear:
          setComponent(entity, FogComponent, new Fog(fog.color, fog.near, fog.far))
          removeFogShader()
          break

        case FogType.Exponential:
          setComponent(entity, FogComponent, new FogExp2(fog.color, fog.density))
          removeFogShader()
          break

        case FogType.Brownian:
          setComponent(entity, FogComponent, new FogExp2(fog.color, fog.density))
          initBrownianMotionFogShader()
          break

        case FogType.Height:
          setComponent(entity, FogComponent, new FogExp2(fog.color, fog.density))
          initHeightFogShader()
          break

        default:
          removeFogShader()
          removeComponent(entity, FogComponent)
          break
      }
      return () => {
        removeFogShader()
        removeComponent(entity, FogComponent)
      }
    }, [fog.type, isVisible])

    useEffect(() => {
      getOptionalComponent(entity, FogComponent)?.color.set(fog.color)
    }, [fog.color])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type !== FogType.Linear) (fogComponent as FogExp2).density = fog.density
    }, [fog.density])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).near = fog.near
    }, [fog.near])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).far = fog.far
    }, [fog.far])

    return null
  }
})
