import { useEffect } from 'react'
import { Color, PointLight } from 'three'

import { defineComponent, removeComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { Schema, useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'

import { EntitySchema } from '@ir-engine/ecs'
import { T } from '../../../schema/schemaFunctions'
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const PointLightComponent = defineComponent({
  name: 'PointLightComponent',
  jsonID: 'EE_point_light',

  schema: Schema.Object({
    color: T.Color(0xffffff),
    intensity: Schema.Number({ default: 1 }),
    range: Schema.Number({ default: 0 }),
    decay: Schema.Number({ default: 2 }),
    castShadow: Schema.Bool({ default: false }),
    shadowBias: Schema.Number({ default: 0 }),
    shadowRadius: Schema.Number({ default: 1 }),
    helperEntity: EntitySchema.Entity({ serialized: false })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)

    const pointLightComponent = useComponent(entity, PointLightComponent)
    const light = useHookstate(() => new PointLight()).value as PointLight

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      setComponent(entity, ObjectComponent, light)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color = new Color(pointLightComponent.color)
    }, [pointLightComponent.color])

    useEffect(() => {
      light.intensity = pointLightComponent.intensity
    }, [pointLightComponent.intensity])

    useEffect(() => {
      light.distance = pointLightComponent.range
    }, [pointLightComponent.range])

    useEffect(() => {
      light.decay = pointLightComponent.decay
    }, [pointLightComponent.decay])

    useEffect(() => {
      light.castShadow = pointLightComponent.castShadow
    }, [pointLightComponent.castShadow])

    useEffect(() => {
      light.shadow.bias = pointLightComponent.shadowBias
    }, [pointLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = pointLightComponent.shadowRadius
    }, [pointLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.set(renderState.shadowMapResolution.value, renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    return null
  }
})
