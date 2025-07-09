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

import { Entity } from '@ir-engine/ecs'
import { getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { WebGLRenderer } from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { RendererComponent } from '../components/RendererComponent'

export type SupportedRenderer = WebGLRenderer | WebGPURenderer

export function isWebGPURenderer(rendererEntity: Entity): boolean {
  const rendererComponent = getOptionalComponent(rendererEntity, RendererComponent)
  if (!rendererComponent?.renderer) return false

  const renderer = rendererComponent.renderer as any

  if (renderer.isWebGPURenderer) return true
  if (renderer.backend && !renderer.backend.isWebGLBackend) return true

  return false
}

export function isWebGLRenderer(rendererEntity: Entity): boolean {
  const rendererComponent = getOptionalComponent(rendererEntity, RendererComponent)
  if (!rendererComponent?.renderer) return false

  const renderer = rendererComponent.renderer as any

  if (renderer.isWebGLRenderer) return true
  if (renderer.backend?.isWebGLBackend) return true
  if (renderer.getContext && !renderer.backend) return true

  return false
}

export function supportsShaderChunkInjection(rendererEntity: Entity): boolean {
  return isWebGLRenderer(rendererEntity)
}

export function supportsOnBeforeCompile(rendererEntity: Entity): boolean {
  return isWebGLRenderer(rendererEntity)
}

export function warnWebGPUIncompatibility(feature: string, rendererEntity: Entity): void {
  if (isWebGPURenderer(rendererEntity)) {
    console.warn(
      `${feature}: This feature is not currently compatible with WebGPU renderer. Consider using WebGL for full compatibility.`
    )
  }
}

export function getMaxCubeMapSize(renderer: SupportedRenderer): number {
  if (!renderer) return 2048
  if (renderer instanceof WebGLRenderer) {
    const gl = renderer.getContext()
    return gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)
  } else if (renderer instanceof WebGPURenderer) {
    return renderer.backend['device'].limits.maxTextureDimension2D
  }
  return 2048
}

export function getMaxShadowCascades(rendererEntity: Entity): number {
  if (isWebGLRenderer(rendererEntity)) {
    return 8
  } else if (isWebGPURenderer(rendererEntity)) {
    return 5
  }
  return 5
}
