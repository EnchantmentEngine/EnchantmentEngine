import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { ChromaticAberrationEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    ChromaticAberrationEffect: ChromaticAberrationEffect
  }
}

const effectKey = 'ChromaticAberrationEffect'

export const ChromaticAberrationEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new ChromaticAberrationEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const chromaticAberrationAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: ChromaticAberrationEffectProcessReactor,
      defaultValues: {
        isActive: false,
        offset: new Vector2(1e-3, 5e-4),
        radialModulation: false,
        modulationOffset: 0.15
      },
      schema: {
        offset: { propertyType: PropertyTypes.Vector2, name: 'Offset' },
        radialModulation: { propertyType: PropertyTypes.Boolean, name: 'Radial Modulation' },
        modulationOffset: { propertyType: PropertyTypes.Number, name: 'Modulation Offset', min: 0, max: 10, step: 0.01 }
      }
    }
  })
}
