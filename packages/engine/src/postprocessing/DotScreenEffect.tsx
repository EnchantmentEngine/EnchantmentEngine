import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, DotScreenEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    DotScreenEffect: DotScreenEffect
  }
}

const effectKey = 'DotScreenEffect'

export const DotScreenEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new DotScreenEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const dotScreenAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: DotScreenEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        angle: Math.PI * 0.5,
        scale: 1.0
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        angle: { propertyType: PropertyTypes.Number, name: 'Angle', min: 0, max: 360, step: 0.1 },
        scale: { propertyType: PropertyTypes.Number, name: 'Scale', min: 0, max: 10, step: 0.1 }
      }
    }
  })
}
