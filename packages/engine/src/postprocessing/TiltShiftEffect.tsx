import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, KernelSize, Resolution, TiltShiftEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    TiltShiftEffect: TiltShiftEffect
  }
}

const effectKey = 'TiltShiftEffect'

export const TiltShiftEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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

    const eff = new TiltShiftEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)

    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey]])

  return null
}

export const tiltShiftAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: TiltShiftEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        offset: 0.0,
        rotation: 0.0,
        focusArea: 0.4,
        feather: 0.3,
        kernelSize: KernelSize.MEDIUM,
        resolutionScale: 0.5,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        offset: { propertyType: PropertyTypes.Number, name: 'Offset', min: 0, max: 10, step: 0.1 },
        rotation: { propertyType: PropertyTypes.Number, name: 'Rotation', min: 0, max: 360, step: 0.1 },
        focusArea: { propertyType: PropertyTypes.Number, name: 'Focus Area', min: 0, max: 10, step: 0.1 },
        feather: { propertyType: PropertyTypes.Number, name: 'Feather', min: 0, max: 10, step: 0.1 },
        kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'KernelSize' },
        resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 0, max: 10, step: 0.1 }
        //resolutionX: Resolution.AUTO_SIZE,
        //resolutionY: Resolution.AUTO_SIZE
      }
    }
  })
}
