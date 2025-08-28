import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { ShockWaveEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector3 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    ShockWaveEffect: ShockWaveEffect
  }
}

const effectKey = 'ShockWaveEffect'

export const ShockWaveEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const camera = getComponent(rendererEntity, CameraComponent)
    const cameraPosition = new Vector3()
    TransformComponent.getWorldPosition(rendererEntity, cameraPosition)

    const eff = new ShockWaveEffect(camera, cameraPosition, effectData[effectKey])
    effects[effectKey] = eff
    setComponent(rendererEntity, RendererComponent)
    return () => {
      delete effects[effectKey]
      if (!hasComponent(rendererEntity, RendererComponent)) return
      setComponent(rendererEntity, RendererComponent)
    }
  }, [isActive, effectData[effectKey]])

  return null
}

export const shockWaveAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: ShockWaveEffectProcessReactor,
      defaultValues: {
        isActive: false,
        position: new Vector3(0, 0, 0),
        speed: 2.0,
        maxRadius: 1.0,
        waveSize: 0.2,
        amplitude: 0.05
      },
      schema: {
        position: { propertyType: PropertyTypes.Vector3, name: 'Position' },
        speed: { propertyType: PropertyTypes.Number, name: 'Speed', min: 0, max: 10, step: 0.05 },
        maxRadius: { propertyType: PropertyTypes.Number, name: 'Max Radius', min: 0, max: 10, step: 0.05 },
        waveSize: { propertyType: PropertyTypes.Number, name: 'Wave Size', min: 0, max: 10, step: 0.05 },
        amplitude: { propertyType: PropertyTypes.Number, name: 'Amplitude', min: 0, max: 10, step: 0.05 }
      }
    }
  })
}
