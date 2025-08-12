import { getMaxCubeMapSize } from '@ir-engine/spatial/src/renderer/functions/RendererBackendUtils'
import {
  CubeCamera,
  LinearFilter,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer
} from 'three'
import { WebGPURenderer } from 'three/webgpu'

export default class CubemapCapturer {
  width: number
  height: number
  renderer: WebGLRenderer | WebGPURenderer
  cubeCamera: CubeCamera
  cubeRenderTarget: WebGLCubeRenderTarget
  sceneToRender: Scene

  constructor(renderer: WebGLRenderer | WebGPURenderer, sceneToRender: Scene, resolution: number) {
    this.width = resolution
    this.height = resolution
    this.sceneToRender = sceneToRender
    this.renderer = renderer
    this.cubeCamera = null!

    const minCubeMapSize = getMaxCubeMapSize(renderer)

    const cubeMapSize = Math.min(resolution, minCubeMapSize)
    this.cubeRenderTarget = new WebGLCubeRenderTarget(cubeMapSize, {
      format: RGBAFormat,
      colorSpace: SRGBColorSpace,
      magFilter: LinearFilter,
      minFilter: LinearFilter
    })
    this.cubeCamera = new CubeCamera(0.1, 1000, this.cubeRenderTarget)
  }

  update = (position: Vector3): WebGLCubeRenderTarget => {
    const autoClear = this.renderer.autoClear
    this.renderer.autoClear = true
    this.cubeCamera.position.copy(position)
    const originalColorSpace = this.renderer.outputColorSpace
    this.renderer.outputColorSpace = SRGBColorSpace
    this.cubeCamera.update(this.renderer, this.sceneToRender)
    this.renderer.outputColorSpace = originalColorSpace
    this.renderer.autoClear = autoClear
    return this.cubeRenderTarget
  }

  dispose() {
    this.cubeRenderTarget.dispose()
  }
}
