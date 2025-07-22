import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { BlendFunction, LUT1DEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    LUT1DEffect: LUT1DEffect
  }
}

const effectKey = 'LUT1DEffect'

export const LUT1DEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  const [lut1DEffectTexture, lut1DEffectTextureError] = useTexture(effectData[effectKey].value?.lutPath!)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }

    if (lut1DEffectTexture) {
      const eff = new LUT1DEffect(lut1DEffectTexture, effectData[effectKey].value)
      effects[effectKey].set(eff)
    }
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey], lut1DEffectTexture])

  return null
}

export const lut1DAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: LUT1DEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.SRC,
        lutPath: undefined,
        lut: undefined
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        lutPath: { propertyType: PropertyTypes.Texture, name: 'LUT' }
      }
    }
  })
}
