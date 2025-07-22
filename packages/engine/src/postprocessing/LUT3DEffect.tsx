import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { BlendFunction, LUT3DEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    LUT3DEffect: LUT3DEffect
  }
}

const effectKey = 'LUT3DEffect'

export const LUT3DEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  const [lut3DEffectTexture, lut3DEffectTextureError] = useTexture(effectData[effectKey].value?.lutPath!)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }

    if (lut3DEffectTexture) {
      const eff = new LUT3DEffect(lut3DEffectTexture, effectData[effectKey].value)
      effects[effectKey].set(eff)
    }
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey], lut3DEffectTexture])

  return null
}

export const lut3DAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: LUT3DEffectProcessReactor,
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
