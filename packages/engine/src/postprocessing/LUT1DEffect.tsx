import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
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

export const LUT1DEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  const [lut1DEffectTexture] = useTexture(effectData[effectKey]?.lutPath)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive || !lut1DEffectTexture) return
    const eff = new LUT1DEffect(lut1DEffectTexture, effectData[effectKey])
    effects[effectKey] = eff
    setComponent(rendererEntity, RendererComponent)
    return () => {
      delete effects[effectKey]
      if (!hasComponent(rendererEntity, RendererComponent)) return
      setComponent(rendererEntity, RendererComponent)
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
