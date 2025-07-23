import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
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

export const ToneMappingEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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

    const eff = new ToneMappingEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)

    return () => {
      effects[effectKey].set(none)
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
