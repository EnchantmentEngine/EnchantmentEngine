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

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
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

  schema: S.Object({
    type: S.Enum(FogType, {
      $comment:
        "A string enum, ie. one of the following values: 'disabled', 'linear', 'exponential', 'brownian', 'height'",
      default: FogType.Disabled
    }),
    color: S.String({ default: '#FFFFFF' }),
    density: S.Number({ default: 0.005 }),
    near: S.Number({ default: 1 }),
    far: S.Number({ default: 1000 }),
    timeScale: S.Number({ default: 1 }),
    height: S.Number({ default: 0.05 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const fog = useComponent(entity, FogSettingsComponent)
    const isVisible = useHasComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!isVisible) return

      const fogData = fog.value
      switch (fogData.type) {
        case FogType.Linear:
          setComponent(entity, FogComponent, new Fog(fogData.color, fogData.near, fogData.far))
          removeFogShader()
          break

        case FogType.Exponential:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          removeFogShader()
          break

        case FogType.Brownian:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          initBrownianMotionFogShader()
          break

        case FogType.Height:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
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
      getOptionalComponent(entity, FogComponent)?.color.set(fog.color.value)
    }, [fog.color])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type.value !== FogType.Linear) (fogComponent as FogExp2).density = fog.density.value
    }, [fog.density])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).near = fog.near.value
    }, [fog.near])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).far = fog.far.value
    }, [fog.far])

    return null
  }
})
