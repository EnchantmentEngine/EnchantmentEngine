import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, DepthOfFieldEffect, Resolution } from 'postprocessing'
import React, { useEffect } from 'react'
import { ArrayCamera } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    DepthOfFieldEffect: DepthOfFieldEffect
  }
}

const effectKey = 'DepthOfFieldEffect'

export const DepthOfFieldEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
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
    const eff = new DepthOfFieldEffect(camera as ArrayCamera, effectData[effectKey])
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

export const depthOfFieldAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: DepthOfFieldEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        focusDistance: 0.0,
        focalLength: 0.1,
        focusRange: 0.1,
        bokehScale: 1.0,
        resolutionScale: 1.0,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        bokehScale: { propertyType: PropertyTypes.Number, name: 'Bokeh Scale', min: -10, max: 10, step: 0.01 },
        focalLength: { propertyType: PropertyTypes.Number, name: 'Focal Length', min: 0, max: 1, step: 0.01 },
        focalRange: { propertyType: PropertyTypes.Number, name: 'Focal Range', min: 0, max: 1, step: 0.01 },
        focusDistance: { propertyType: PropertyTypes.Number, name: 'Focus Distance', min: 0, max: 1, step: 0.01 },
        resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: -10, max: 10, step: 0.01 }
      }
    }
  })
}
