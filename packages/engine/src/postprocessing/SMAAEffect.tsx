import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { EdgeDetectionMode, PredicationMode, SMAAEffect, SMAAPreset } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'SMAAEffect'

export const SMAAEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new SMAAEffect(effectData[effectKey].granularity.value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const smaaAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: SMAAEffectProcessReactor,
      defaultValues: {
        isActive: false,
        preset: SMAAPreset.MEDIUM,
        edgeDetectionMode: EdgeDetectionMode.COLOR,
        predicationMode: PredicationMode.DISABLED
      },
      schema: {
        preset: { propertyType: PropertyTypes.SMAAPreset, name: 'Preset' }
      }
    }
  })
}
