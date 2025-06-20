/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineComponent,
  defineQuery,
  defineSystem,
  Entity,
  getComponent,
  getMutableComponent,
  hasComponent,
  PresentationSystemGroup,
  S,
  setComponent,
  useComponent
} from '@ir-engine/ecs'
import { useEffect } from 'react'
import { ArrayCamera, Scene } from 'three'
import { PostProcessing, WebGPURenderer } from 'three/webgpu'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { PostProcessingComponent } from '../components/PostProcessingComponent'
import { RendererComponent } from '../components/RendererComponent'
import { isWebGPURenderer } from '../functions/RendererBackendUtils'

export const WebGPUPostProcessingComponent = defineComponent({
  name: 'WebGPUPostProcessingComponent',

  schema: S.Object({
    postProcessing: S.Type<PostProcessing | null>(),
    enabled: S.Bool(),
    needsRebuild: S.Bool(),
    outputNode: S.Type<any>(),
    effects: S.Record(S.String(), S.Any())
  }),

  onInit: (entity) => {
    return {
      postProcessing: null as PostProcessing | null,
      enabled: false,
      needsRebuild: true,
      outputNode: null,
      effects: {} as Record<string, any>
    }
  }
})

const webgpuPostProcessingQuery = defineQuery([WebGPUPostProcessingComponent, RendererComponent])

export const WebGPUPostProcessingSystem = defineSystem({
  uuid: 'ee.engine.WebGPUPostProcessingSystem',
  insert: { with: PresentationSystemGroup },
  execute: () => {
    for (const entity of webgpuPostProcessingQuery()) {
      const postProcessingComponent = getMutableComponent(entity, WebGPUPostProcessingComponent)
      const rendererComponent = getComponent(entity, RendererComponent)

      if (!postProcessingComponent.postProcessing.value || !rendererComponent.renderer) {
        continue
      }

      if (postProcessingComponent.needsRebuild.value) {
        buildPostProcessingPipeline(entity, postProcessingComponent, rendererComponent)
        postProcessingComponent.needsRebuild.set(false)
      }
    }
  }
})

export function renderWebGPUPostProcessing(
  entity: Entity,
  scene: Scene,
  camera: ArrayCamera,
  renderer: WebGPURenderer
): boolean {
  if (!hasComponent(entity, WebGPUPostProcessingComponent)) {
    return false
  }

  const postProcessingComponent = getComponent(entity, WebGPUPostProcessingComponent)

  if (postProcessingComponent.enabled && postProcessingComponent.postProcessing && postProcessingComponent.outputNode) {
    postProcessingComponent.postProcessing.render()
    return true
  }

  return false
}

function buildPostProcessingPipeline(
  entity: Entity,
  postProcessingComponent: ReturnType<typeof getMutableComponent<typeof WebGPUPostProcessingComponent>>,
  rendererComponent: typeof RendererComponent._TYPE
) {
  const renderer = rendererComponent.renderer as WebGPURenderer
  const scene = rendererComponent.scene
  const camera = getComponent(entity, CameraComponent) as ArrayCamera

  if (!postProcessingComponent.enabled.value || !scene || !camera) {
    postProcessingComponent.outputNode.set(null)
    return
  }

  const activeEffects = getActiveEffectsFromRegistry(postProcessingComponent.effects.value)

  if (activeEffects.length === 0) {
    postProcessingComponent.outputNode.set(null)
    return
  }

  let outputNode = createScenePass(scene, camera)

  for (const effect of activeEffects) {
    outputNode = applyWebGPUEffect(outputNode, effect.type, effect.config)
  }

  postProcessingComponent.outputNode.set(outputNode)

  if (postProcessingComponent.postProcessing.value) {
    console.log(
      'WebGPU post processing pipeline built with effects:',
      activeEffects.map((e) => e.type)
    )
  }
}

function getActiveEffectsFromRegistry(
  effects: Record<string, any>
): Array<{ type: string; priority: number; config: any }> {
  const activeEffects: Array<{ type: string; priority: number; config: any }> = []

  for (const effectKey in effects) {
    const effectData = effects[effectKey]
    if (effectData?.isActive) {
      activeEffects.push({
        type: effectKey,
        priority: effectData.priority || 0,
        config: effectData
      })
    }
  }

  activeEffects.sort((a, b) => a.priority - b.priority)

  return activeEffects
}

/**
 * Create a scene pass for WebGPU post processing
 * TODO: Implement
 */
function createScenePass(scene: Scene, camera: ArrayCamera): any {
  // Placeholder - will use actual TSL pass() function when available
  console.log('Creating WebGPU scene pass')
  return { type: 'scenePass', scene, camera }
}

/**
 * Apply a WebGPU effect to the input node
 * TODO: Implement
 */
function applyWebGPUEffect(inputNode: any, effectType: string, config: any): any {
  console.log(`Applying WebGPU effect: ${effectType}`, config)

  // use actual TSL effect nodes
  return {
    type: 'effect',
    effectType,
    config,
    input: inputNode
  }
}

export const WebGPUPostProcessingReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const postProcessingComponent = useComponent(entity, PostProcessingComponent)
  const renderer = useComponent(rendererEntity, RendererComponent)

  useEffect(() => {
    if (isWebGPURenderer(rendererEntity) && !hasComponent(rendererEntity, WebGPUPostProcessingComponent)) {
      setComponent(rendererEntity, WebGPUPostProcessingComponent)
    }
  }, [rendererEntity])

  useEffect(() => {
    if (!isWebGPURenderer(rendererEntity) || !hasComponent(rendererEntity, WebGPUPostProcessingComponent)) {
      return
    }

    const webgpuPostProcessing = getMutableComponent(rendererEntity, WebGPUPostProcessingComponent)

    webgpuPostProcessing.effects.set(postProcessingComponent.effects.value)
    webgpuPostProcessing.enabled.set(postProcessingComponent.enabled.value)
    webgpuPostProcessing.needsRebuild.set(true)

    if (!webgpuPostProcessing.postProcessing.value && renderer.renderer.value) {
      const postProcessing = new PostProcessing(renderer.renderer.value as WebGPURenderer)
      webgpuPostProcessing.postProcessing.set(postProcessing)
    }
  }, [rendererEntity, postProcessingComponent.effects, postProcessingComponent.enabled, renderer.renderer.value])

  return null
}
