import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
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

export const LUT3DEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  const [lut3DEffectTexture] = useTexture(effectData[effectKey]?.lutPath)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive || !lut3DEffectTexture) return
    const eff = new LUT3DEffect(lut3DEffectTexture, effectData[effectKey])
    effects[effectKey] = eff
    setComponent(rendererEntity, RendererComponent)
    return () => {
      delete effects[effectKey]
      if (!hasComponent(rendererEntity, RendererComponent)) return
      setComponent(rendererEntity, RendererComponent)
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
