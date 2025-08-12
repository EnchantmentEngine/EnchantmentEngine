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
