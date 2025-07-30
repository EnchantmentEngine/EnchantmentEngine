import { Entity, defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ErrorBoundary, getState, useMutableState } from '@ir-engine/hyperflux'
import { EffectComposer } from 'postprocessing'
import React, { Suspense } from 'react'
import { Scene } from 'three'
import { PostProcessingEffectState } from '../effects/EffectRegistry'
import { isWebGPURenderer } from '../functions/RendererBackendUtils'
import { useRendererEntity } from '../functions/useRendererEntity'

import { EffectSchema, RendererComponent } from './RendererComponent'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  schema: S.Object({
    enabled: S.Bool(),
    effects: S.Record(S.String(), EffectSchema)
  }),

  onInit: () => {
    return {
      enabled: false,
      effects: {} as Record<string, any>
    }
  },

  /** @todo this will be replaced with spatial queries or distance checks */
  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useRendererEntity(entity)

    if (!rendererEntity) return null

    return <PostProcessingReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const PostProcessingReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const postProcessingComponent = useComponent(entity, PostProcessingComponent)
  const EffectRegistry = useMutableState(PostProcessingEffectState).keys
  const renderer = useComponent(rendererEntity, RendererComponent)
  const effects = renderer.effects
  const passes = renderer.passes
  const composer = renderer.effectComposer as EffectComposer
  const scene = renderer.scene as Scene
  const isWebGPU = isWebGPURenderer(rendererEntity)

  if (!postProcessingComponent.enabled) return null

  if (isWebGPU) {
    return <WebGPUPostProcessingReactor entity={entity} rendererEntity={rendererEntity} />
  }

  // for each effect specified in our postProcessingComponent, we mount a sub-reactor based on the effect registry for that effect ID
  return (
    <>
      {EffectRegistry.map((key) => {
        const effect = getState(PostProcessingEffectState)[key] // get effect registry entry
        if (!effect) return null
        return (
          <Suspense key={key}>
            <ErrorBoundary>
              <effect.reactor
                isActive={postProcessingComponent.effects[key]?.isActive}
                rendererEntity={rendererEntity}
                effectData={postProcessingComponent.effects}
                entity={entity}
                effects={effects}
                composer={composer}
                scene={scene}
                passes={passes}
              />
            </ErrorBoundary>
          </Suspense>
        )
      })}
    </>
  )
}

const WebGPUPostProcessingReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const postProcessingComponent = useComponent(entity, PostProcessingComponent)
  const renderer = useComponent(rendererEntity, RendererComponent)

  React.useEffect(() => {
    const webgpuPipeline = renderer.webgpuPostProcessingPipeline
    if (!webgpuPipeline || !postProcessingComponent.enabled) return

    webgpuPipeline.updateEffects(postProcessingComponent.effects.value)

    console.log('WebGPU post processing pipeline updated')
  }, [postProcessingComponent.effects, postProcessingComponent.enabled, renderer.webgpuPostProcessingPipeline])

  return null
}
