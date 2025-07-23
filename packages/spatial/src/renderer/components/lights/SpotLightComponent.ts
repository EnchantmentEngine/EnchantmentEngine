import { useEffect } from 'react'
import { Color, SpotLight } from 'three'

import { S, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

// const ringGeom = new TorusGeometry(0.1, 0.025, 8, 12)
// const coneGeom = new ConeGeometry(0.25, 0.5, 8, 1, true)
// coneGeom.translate(0, -0.25, 0)
// coneGeom.rotateX(-Math.PI / 2)
// const geom = mergeBufferGeometries([ringGeom, coneGeom])!
// const helperMaterial = new MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.5, side: DoubleSide })

export const SpotLightComponent = defineComponent({
  name: 'SpotLightComponent',
  jsonID: 'EE_spot_light',

  schema: S.Object({
    color: T.Color(0xffffff),
    intensity: S.Number({ default: 10 }),
    range: S.Number({ default: 0 }),
    decay: S.Number({ default: 2 }),
    angle: S.Number({ default: Math.PI / 3 }),
    penumbra: S.Number({ default: 1 }),
    castShadow: S.Bool({ default: false }),
    shadowBias: S.Number({ default: 0 }),
    shadowRadius: S.Number({ default: 1 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)

    const spotLightComponent = useComponent(entity, SpotLightComponent)
    const light = useHookstate(() => new SpotLight()).value as SpotLight

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      light.target.position.set(1, 0, 0)
      light.target.name = 'light-target'
      setComponent(entity, ObjectComponent, light)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.intensity = spotLightComponent.intensity
    }, [spotLightComponent.intensity])

    useEffect(() => {
      light.distance = spotLightComponent.range
    }, [spotLightComponent.range])

    useEffect(() => {
      light.decay = spotLightComponent.decay
    }, [spotLightComponent.decay])

    useEffect(() => {
      light.angle = spotLightComponent.angle
    }, [spotLightComponent.angle])

    useEffect(() => {
      light.penumbra = spotLightComponent.penumbra
    }, [spotLightComponent.penumbra])

    useEffect(() => {
      light.shadow.bias = spotLightComponent.shadowBias
    }, [spotLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = spotLightComponent.shadowRadius
    }, [spotLightComponent.shadowRadius])

    useEffect(() => {
      light.castShadow = spotLightComponent.castShadow
    }, [spotLightComponent.castShadow])

    useEffect(() => {
      light.color = new Color(spotLightComponent.color)
    }, [spotLightComponent.color])

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
