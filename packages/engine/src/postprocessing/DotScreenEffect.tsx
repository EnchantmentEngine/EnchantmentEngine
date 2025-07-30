import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
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

export const DotScreenEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const eff = new DotScreenEffect(effectData[effectKey])
    effects[effectKey] = eff
    setComponent(rendererEntity, RendererComponent)
    return () => {
      delete effects[effectKey]
      if (!hasComponent(rendererEntity, RendererComponent)) return
      setComponent(rendererEntity, RendererComponent)
    }
  }, [isActive, effectData[effectKey]])

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
