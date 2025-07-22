import { Entity, getComponent } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
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

export const DepthOfFieldEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    const camera = getComponent(rendererEntity, CameraComponent)
    const eff = new DepthOfFieldEffect(camera as ArrayCamera, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

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
