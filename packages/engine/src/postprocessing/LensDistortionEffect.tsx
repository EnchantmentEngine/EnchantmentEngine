import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { LensDistortionEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    LensDistortionEffect: LensDistortionEffect
  }
}

const effectKey = 'LensDistortionEffect'

export const LensDistortionEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const eff = new LensDistortionEffect(effectData[effectKey])
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

export const lensDistortionAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: LensDistortionEffectProcessReactor,
      defaultValues: {
        isActive: false,
        distortion: new Vector2(0, 0),
        principalPoint: new Vector2(0, 0),
        focalLength: new Vector2(1, 1),
        skew: 0
      },
      schema: {
        distortion: { propertyType: PropertyTypes.Vector2, name: 'Distortion' },
        principalPoint: { propertyType: PropertyTypes.Vector2, name: 'Principal Point' },
        focalLength: { propertyType: PropertyTypes.Vector2, name: 'Focal Length' },
        skew: { propertyType: PropertyTypes.Number, name: 'Skew', min: 0, max: 10, step: 0.05 }
      }
    }
  })
}
