import { useEffect } from 'react'
import { DirectionalLight } from 'three'

import {
  S,
  defineComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'EE_directional_light',

  schema: S.Object({
    light: S.Type<DirectionalLight>({ serialized: false }),
    color: T.Color(),
    intensity: S.Number({ default: 1 }),
    castShadow: S.Bool({ default: false }),
    shadowBias: S.Number({ default: -0.00001 }),
    shadowRadius: S.Number({ default: 1 }),
    cameraFar: S.Number({ default: 200 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)
    const light = useHookstate(() => new DirectionalLight()).value as DirectionalLight

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      getMutableComponent(entity, DirectionalLightComponent).light.set(light)
      setComponent(entity, ObjectComponent, light)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color.set(directionalLightComponent.color.value)
    }, [directionalLightComponent.color])

    useEffect(() => {
      light.intensity = directionalLightComponent.intensity.value
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      light.shadow.camera.far = directionalLightComponent.cameraFar.value
      light.shadow.camera.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      light.shadow.bias = directionalLightComponent.shadowBias.value
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = directionalLightComponent.shadowRadius.value
    }, [directionalLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    return null
  }
})
