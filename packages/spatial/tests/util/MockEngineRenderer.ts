import { Entity, getComponent, setComponent } from '@ir-engine/ecs'
import { EffectComposer, Pass, RenderPass } from 'postprocessing'
import { WebGLCoordinateSystem, WebGLRenderTarget, WebGLRenderer, WebGLShadowMap } from 'three'
import { RendererComponent } from '../../src/renderer/components/RendererComponent'
import { createWebXRManager } from '../../src/xr/WebXRManager'
import { MockEventListener } from './MockEventListener'

const mockCanvas = new MockEventListener() as any
mockCanvas.parentElement = new MockEventListener()
mockCanvas.getContext = () => null! // null will tell the renderer to not initialize, allowing our mock to work
mockCanvas.style = {
  display: 'initial' /** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/display) */
} as CSSStyleDeclaration

const mockContext = {
  getExtension: () => {},
  getParameter: () => {},
  getContextAttributes: () => {
    return {
      xrCompatible: true
    }
  },
  canvas: mockCanvas,
  viewport: () => {}
}

class MockRenderer {
  cancelAnimationFrame = () => {}
  setAnimationLoop = () => {}
  animation = {
    start: () => {},
    stop: () => {},
    setAnimationLoop: () => {},
    setContext: () => {}
  }
  domElement = mockCanvas
  setPixelRatio = () => {}
  getRenderTarget = () => {}
  setRenderTarget = () => {}
  getSize = () => 0
  getContext = () => mockContext
  getPixelRatio = () => 1
  dispose = () => {}
  capabilities = {
    isWebGL2: true
  }
  shadowMap = {
    enabled: false,
    autoUpdate: true
  } as WebGLShadowMap
  coordinateSystem = WebGLCoordinateSystem
  getActiveCubeFace = () => 1
  getActiveMipmapLevel = () => 1
  xr = {
    enabled: true
  }
  render = () => {}
}

class MockEffectComposer extends EffectComposer {
  constructor(renderer?: MockRenderer) {
    super(renderer as unknown as WebGLRenderer)
  }
  addPass(pass: Pass, index?: number | undefined): void {
    const passes = this.passes
    if (index !== undefined) {
      passes.splice(index, 0, pass)
    } else {
      passes.push(pass)
    }
  }
  render = () => {}
  setSize = () => {}
  getSize = () => 0
  setRenderer = () => {}
  replaceRenderer = () => this.getRenderer()
  createDepthTexture = () => {}
  createBuffer = () => new WebGLRenderTarget()
}

export const mockEngineRenderer = (entity: Entity) => {
  const renderer = new MockRenderer() as unknown as WebGLRenderer
  const effectComposer = new MockEffectComposer()
  const renderPass = new RenderPass()
  effectComposer.addPass(renderPass)
  const xrManager = createWebXRManager(renderer)
  xrManager.cameraAutoUpdate = false
  xrManager.enabled = true
  setComponent(entity, RendererComponent, { canvas: renderer.domElement })
  const renderComponent = getComponent(entity, RendererComponent)
  renderComponent.renderer = renderer
  renderComponent.effectComposer = effectComposer
  renderComponent.renderContext = mockContext as any
  renderComponent.renderPass = renderPass
  renderComponent.xrManager = xrManager
}
