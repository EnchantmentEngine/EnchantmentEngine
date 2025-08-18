import { useEffect } from 'react'
import { DirectionalLight } from 'three'

import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { Schema, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'EE_directional_light',

  schema: Schema.Object({
    light: Schema.Type<DirectionalLight>({ serialized: false }),
    color: T.Color(),
    intensity: Schema.Number({ default: 1 }),
    castShadow: Schema.Bool({ default: false }),
    shadowBias: Schema.Number({ default: -0.00001 }),
    shadowRadius: Schema.Number({ default: 1 }),
    cameraFar: Schema.Number({ default: 200 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)
    const light = useHookstate(() => new DirectionalLight()).value as DirectionalLight

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      getComponent(entity, DirectionalLightComponent).light = light
      setComponent(entity, ObjectComponent, light)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color.set(directionalLightComponent.color)
    }, [directionalLightComponent.color])

    useEffect(() => {
      light.intensity = directionalLightComponent.intensity
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      light.shadow.camera.far = directionalLightComponent.cameraFar
      light.shadow.camera.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      light.shadow.bias = directionalLightComponent.shadowBias
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = directionalLightComponent.shadowRadius
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
