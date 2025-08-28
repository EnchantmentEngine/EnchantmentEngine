import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, ToneMappingEffect, ToneMappingMode } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    ToneMappingEffect: ToneMappingEffect
  }
}

const effectKey = 'ToneMappingEffect'

export const ToneMappingEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const eff = new ToneMappingEffect(effectData[effectKey])
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

export const toneMappingAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: ToneMappingEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.SRC,
        adaptive: false,
        mode: ToneMappingMode.REINHARD,
        resolution: 256,
        maxLuminance: 4.0,
        whitePoint: 4.0,
        middleGrey: 0.6,
        minLuminance: 0.01,
        averageLuminance: 1.0,
        adaptationRate: 1.0
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        adaptive: { propertyType: PropertyTypes.Boolean, name: 'Adaptive' },
        adaptationRate: { propertyType: PropertyTypes.Number, name: 'Adaptation Rate', min: -1, max: 1, step: 0.01 },
        averageLuminance: {
          propertyType: PropertyTypes.Number,
          name: 'Average Luminance',
          min: -1,
          max: 1,
          step: 0.01
        },
        maxLuminance: { propertyType: PropertyTypes.Number, name: 'Max Luminance', min: -1, max: 1, step: 0.01 },
        middleGrey: { propertyType: PropertyTypes.Number, name: 'Middle Grey', min: -1, max: 1, step: 0.01 },
        resolution: { propertyType: PropertyTypes.Number, name: 'Resolution' },
        whitePoint: { propertyType: PropertyTypes.Number, name: 'Resolution' },
        minLuminance: { propertyType: PropertyTypes.Number, name: 'Resolution' }
      }
    }
  })
}
