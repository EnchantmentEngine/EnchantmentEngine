import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, GlitchEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    GlitchEffect: GlitchEffect
  }
}

const effectKey = 'GlitchEffect'

export const GlitchEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new GlitchEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const glitchAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: GlitchEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        chromaticAberrationOffset: undefined,
        delay: new Vector2(1.5, 3.5),
        duration: new Vector2(0.6, 1.0),
        strength: new Vector2(0.3, 1.0),
        perturbationMap: undefined,
        dtSize: 64,
        columns: 0.05,
        ratio: 0.85
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        chromaticAberrationOffset: { propertyType: PropertyTypes.Vector2, name: 'Chromatic Aberration Offset' },
        delay: { propertyType: PropertyTypes.Vector2, name: 'Delay' },
        duration: { propertyType: PropertyTypes.Vector2, name: 'Duration' },
        strength: { propertyType: PropertyTypes.Vector2, name: 'Strength' },
        perturbationMap: { propertyType: PropertyTypes.Texture, name: 'Perturbation Map' },
        dtSize: { propertyType: PropertyTypes.Number, name: 'DT Size', min: 0, max: 10, step: 0.1 },
        columns: { propertyType: PropertyTypes.Number, name: 'Columns', min: 0, max: 10, step: 0.1 },
        ratio: { propertyType: PropertyTypes.Number, name: 'Ratio', min: 0, max: 10, step: 0.1 }
      }
    }
  })
}
