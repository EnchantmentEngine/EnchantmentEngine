import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, BloomEffect, KernelSize } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    BloomEffect: BloomEffect
  }
}

const effectKey = 'BloomEffect'

export const BloomEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new BloomEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const bloomAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: BloomEffectProcessReactor,
      defaultValues: {
        isActive: true,
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.LARGE,
        luminanceThreshold: 0.9,
        luminanceSmoothing: 0.025,
        mipmapBlur: false,
        intensity: 1.0,
        radius: 0.85,
        levels: 8
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'Kernel Size' },
        intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: 0, max: 10, step: 0.01 },
        luminanceSmoothing: {
          propertyType: PropertyTypes.Number,
          name: 'Luminance Smoothing',
          min: 0,
          max: 1,
          step: 0.01
        },
        luminanceThreshold: {
          propertyType: PropertyTypes.Number,
          name: 'Luminance Threshold',
          min: 0,
          max: 1,
          step: 0.01
        },
        mipmapBlur: { propertyType: PropertyTypes.Boolean, name: 'Mipmap Blur' },
        radius: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 0, max: 10, step: 0.01 },
        levels: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 1, max: 10, step: 1 }
      }
    }
  })
}
