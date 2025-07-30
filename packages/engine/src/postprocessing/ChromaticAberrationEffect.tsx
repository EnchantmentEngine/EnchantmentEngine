import { hasComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
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

export const ChromaticAberrationEffectProcessReactor: React.FC<EffectReactorProps> = (props) => {
  const { isActive, entity, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (!effectData[effectKey]) {
      effectData[effectKey] = effectState[effectKey].defaultValues
      setComponent(entity, PostProcessingComponent)
      return
    }
    if (!isActive) return
    const eff = new ChromaticAberrationEffect(effectData[effectKey])
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
