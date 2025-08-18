import { Entity, defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { ErrorBoundary, Schema, getState, useMutableState } from '@ir-engine/hyperflux'
import { EffectComposer } from 'postprocessing'
import React, { Suspense, useEffect } from 'react'
import { Scene } from 'three'
import { PostProcessingEffectState } from '../effects/EffectRegistry'
import { isWebGPURenderer } from '../functions/RendererBackendUtils'
import { useRendererEntity } from '../functions/useRendererEntity'
import { updateWebGPUPostProcessing } from '../webgpu/WebGPUPostProcessingPipeline'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { RendererState } from '../RendererState'
import { EffectSchema, RendererComponent } from './RendererComponent'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  schema: Schema.Object({
    enabled: Schema.Bool(),
    effects: Schema.Record(Schema.String(), EffectSchema)
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
  const renderSettings = useMutableState(RendererState)
  const effects = renderer.effects
  const passes = renderer.passes
  const composer = renderer.effectComposer as EffectComposer
  const scene = renderer.scene as Scene
  const isWebGPU = isWebGPURenderer(rendererEntity)

  if (!renderSettings.usePostProcessing) return null
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
  const camera = useComponent(rendererEntity, CameraComponent) as any
  const renderSettings = useMutableState(RendererState)

  useEffect(() => {
    const postProcessing = renderer.postProcessing
    if (!postProcessing) return

    const enabled = renderSettings.usePostProcessing.value
    const effects = enabled ? postProcessingComponent.effects : {}
    if (renderer.renderer && renderer.scene && camera) {
      updateWebGPUPostProcessing(postProcessing, renderer.scene, camera, effects)
    }
  }, [
    postProcessingComponent.effects,
    postProcessingComponent.enabled,
    renderer.postProcessing,
    renderer.renderer,
    renderer.scene,
    renderSettings.usePostProcessing.value
  ])

  return null
}
