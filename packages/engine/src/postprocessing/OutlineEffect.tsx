import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, KernelSize, OutlineEffect, Resolution } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'OutlineEffect'

export const OutlineEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new OutlineEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const outlineAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: OutlineEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.SCREEN,
        patternScale: 60.0,
        edgeStrength: 5.0,
        pulseSpeed: 0.0,
        visibleEdgeColor: 0xffffff,
        hiddenEdgeColor: 0x22090a,
        multisampling: 0,
        resolutionScale: 0.5,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE,
        width: Resolution.AUTO_SIZE,
        height: 480,
        kernelSize: KernelSize.VERY_SMALL,
        blur: false,
        xRay: true
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        patternScale: { propertyType: PropertyTypes.Number, name: 'Pattern Scale', min: 0, max: 10, step: 0.01 },
        edgeStrength: { propertyType: PropertyTypes.Number, name: 'Edge Strength', min: 0, max: 10, step: 0.01 },
        pulseSpeed: { propertyType: PropertyTypes.Number, name: 'Pulse Speed', min: 0, max: 10, step: 0.01 },
        visibleEdgeColor: { propertyType: PropertyTypes.Color, name: 'Visible Edge Color' },
        hiddenEdgeColor: { propertyType: PropertyTypes.Color, name: 'Hidden Edge Color' },
        multisampling: { propertyType: PropertyTypes.Number, name: 'Multisampling', min: 0, max: 10, step: 0.01 },
        resolutionScale: { propertyType: PropertyTypes.Number, name: 'ResolutionScale', min: 0, max: 10, step: 0.01 },
        blur: { propertyType: PropertyTypes.Boolean, name: 'Blur' },
        xRay: { propertyType: PropertyTypes.Boolean, name: 'xRay' },
        kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'KernelSize' }
        //resolutionX: Resolution.AUTO_SIZE,
        //resolutionY: Resolution.AUTO_SIZE,
        //width: Resolution.AUTO_SIZE,
        //height: 480,
      }
    }
  })
}
