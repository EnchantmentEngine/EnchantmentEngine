import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, ScanlineEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    ScanlineEffect: ScanlineEffect
  }
}

const effectKey = 'ScanlineEffect'

export const ScanlineEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const eff = new ScanlineEffect(effectData[effectKey])
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

export const scanlineAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: ScanlineEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.OVERLAY,
        density: 1.25,
        scrollSpeed: 0.0
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        density: { propertyType: PropertyTypes.Number, name: 'Density', min: 0, max: 10, step: 0.05 },
        scrollSpeed: { propertyType: PropertyTypes.Number, name: 'Scroll Speed', min: 0, max: 10, step: 0.05 }
      }
    }
  })
}
