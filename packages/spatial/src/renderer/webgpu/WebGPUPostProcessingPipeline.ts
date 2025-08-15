import { ArrayCamera, Scene } from 'three'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { ao } from 'three/addons/tsl/display/GTAONode.js'
import { mrt, normalView, output, pass } from 'three/tsl'
import { PostProcessing, WebGPURenderer } from 'three/webgpu'
import { createWebGPUEffectNodes, createWebGPUScenePass, WebGPUEffectNode } from './WebGPUEffectNodes'

export class WebGPUPostProcessingPipeline {
  private postProcessing: PostProcessing
  private renderer: WebGPURenderer
  private scene: Scene
  private camera: ArrayCamera
  private effectNodes: WebGPUEffectNode[] = []
  private outputNode: any = null

  constructor(renderer: WebGPURenderer, scene: Scene, camera: ArrayCamera) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.postProcessing = new PostProcessing(renderer)
  }

  updateEffects(effects: Record<string, any>): void {
    try {
      this.effectNodes = createWebGPUEffectNodes(effects)

      if (this.effectNodes.length === 0) {
        this.outputNode = null
        return
      }

      this.buildEffectChain()

      console.log(
        'WebGPU post processing pipeline updated with effects:',
        this.effectNodes.map((node) => node.type)
      )
    } catch (error) {
      console.warn('Failed to update WebGPU post processing pipeline:', error)
    }
  }

  private buildEffectChain(): void {
    let currentNode = createWebGPUScenePass(this.scene, this.camera)

    for (const effectNode of this.effectNodes) {
      currentNode = this.applyEffectNode(currentNode, effectNode)
    }

    this.outputNode = currentNode

    this.updatePostProcessingInstance()
  }

  private applyEffectNode(inputNode: WebGPUEffectNode, effectNode: WebGPUEffectNode): WebGPUEffectNode {
    effectNode.input = inputNode

    this.createTSLNode(effectNode)

    return effectNode
  }

  private async createTSLNode(effectNode: WebGPUEffectNode): Promise<void> {
    try {
      const tsl = await import('three/tsl')

      switch (effectNode.type) {
        case 'scenePass':
          effectNode.tslNode = tsl.pass(effectNode.config.scene, effectNode.config.camera)
          break

        case 'BloomEffect':
          effectNode.tslNode = await this.createBloomTSLNode(tsl, effectNode)
          break

        // case 'FXAAEffect':
        //   effectNode.tslNode = await this.createFXAATSLNode(tsl, effectNode)
        //   break

        // case 'ToneMappingEffect':
        //   effectNode.tslNode = await this.createToneMappingTSLNode(tsl, effectNode)
        //   break

        // case 'SMAAEffect':
        //   effectNode.tslNode = await this.createSMAATSLNode(tsl, effectNode)
        //   break

        default:
          console.warn(`TSL node creation for ${effectNode.type} not implemented yet`)
          break
      }
    } catch (error) {
      console.warn(`Failed to create TSL node for ${effectNode.type}:`, error)
    }
  }

  private async createBloomTSLNode(tsl: any, effectNode: WebGPUEffectNode): Promise<any> {
    const config = effectNode.config

    const inputNode = effectNode.input?.tslNode || effectNode.input

    const luminance = tsl.luminance ? tsl.luminance(inputNode) : inputNode
    const threshold = tsl.threshold ? tsl.threshold(luminance, config.luminanceThreshold) : luminance

    return tsl.bloom
      ? tsl.bloom(threshold, {
          intensity: config.intensity,
          radius: config.radius,
          levels: config.levels
        })
      : threshold
  }

  private async createFXAATSLNode(tsl: any, effectNode: WebGPUEffectNode): Promise<any> {
    const inputNode = effectNode.input?.tslNode || effectNode.input
    return tsl.fxaa ? tsl.fxaa(inputNode) : inputNode
  }

  private async createToneMappingTSLNode(tsl: any, effectNode: WebGPUEffectNode): Promise<any> {
    const config = effectNode.config
    const inputNode = effectNode.input?.tslNode || effectNode.input

    return tsl.toneMapping
      ? tsl.toneMapping(inputNode, {
          mode: config.mode,
          exposure: config.maxLuminance,
          whitePoint: config.whitePoint
        })
      : inputNode
  }

  private async createSMAATSLNode(tsl: any, effectNode: WebGPUEffectNode): Promise<any> {
    const config = effectNode.config
    const inputNode = effectNode.input?.tslNode || effectNode.input

    return tsl.smaa
      ? tsl.smaa(inputNode, {
          preset: config.preset,
          edgeDetectionMode: config.edgeDetectionMode
        })
      : inputNode
  }

  private updatePostProcessingInstance(): void {
    console.log(this.outputNode)
    if (!this.outputNode) {
      ;(this.postProcessing as any).outputNode = null
      return
    }

    try {
      // (this.postProcessing as any)._effectChain = {
      //   nodes: this.effectNodes,
      //   outputNode: this.outputNode
      // }

      this.buildTSLChain()
    } catch (error) {
      console.warn('Failed to update PostProcessing instance:', error)
    }
  }

  private async buildTSLChain(): Promise<void> {
    try {
      const currentTSLNode = pass(this.scene, this.camera)

      currentTSLNode.setMRT(
        mrt({
          output: output,
          normal: normalView
        })
      )

      const passInfo = {
        color: currentTSLNode.getTextureNode('output'),
        normal: currentTSLNode.getTextureNode('normal'),
        depth: currentTSLNode.getTextureNode('depth')
      }

      let currentColorNode = passInfo.color

      for (const effectNode of this.effectNodes) {
        currentColorNode = await this.applyTSLEffect(passInfo, this.camera, effectNode, currentColorNode)
      }

      this.postProcessing.outputNode = currentColorNode
      this.postProcessing.needsUpdate = true

      console.log('TSL effect chain built successfully with', this.effectNodes.length, 'effects')
    } catch (error) {
      console.warn('Failed to build TSL effect chain:', error)
      try {
        const tsl = await import('three/tsl')
        const scenePass = tsl.pass(this.scene, this.camera)
        ;(this.postProcessing as any).outputNode = scenePass
      } catch (fallbackError) {
        console.warn('Failed to set fallback scene pass:', fallbackError)
      }
    }
  }

  private async applyTSLEffect(
    passInfo: any,
    camera: any,
    effectNode: WebGPUEffectNode,
    currentColorNode: any
  ): Promise<any> {
    const config = effectNode.config

    switch (effectNode.type) {
      case 'BloomEffect':
        return this.applyBloomTSL(currentColorNode, config)

      case 'SSAOEffect':
        return this.applySSAOEffect(passInfo, camera, currentColorNode)

      // case 'FXAAEffect':
      //   return this.applyFXAATSL(tsl, currentColorNode, config)

      // case 'ToneMappingEffect':
      //   return this.applyToneMappingTSL(tsl, currentColorNode, config)

      // case 'NoiseEffect':
      //   return this.applyNoiseTSL(tsl, currentColorNode, config)

      // case 'VignetteEffect':
      //   return this.applyVignetteTSL(tsl, currentColorNode, config)

      // case 'ChromaticAberrationEffect':
      //   return this.applyChromaticAberrationTSL(tsl, currentColorNode, config)

      // case 'DotScreenEffect':
      //   return this.applyDotScreenTSL(tsl, currentColorNode, config)

      default:
        console.warn(`TSL effect ${effectNode.type} not implemented, skipping`)
        return currentColorNode
    }
  }
  applySSAOEffect(passInfo: any, camera: any, currentColorNode: any): any {
    const aoPass = ao(passInfo.depth, passInfo.normal, camera)
    // aoPass.resolutionScale = 0.5;
    aoPass.distanceExponent.value = 1.0
    aoPass.distanceFallOff.value = 1.0
    aoPass.radius.value = 0.1

    const blendPassAO = aoPass.getTextureNode().mul(currentColorNode)

    // const denoisePass = denoise( aoPass.getTextureNode(), passInfo.depth, passInfo.normal, camera );
    // const blendPassDenoise = denoisePass.mul( currentColorNode );

    return blendPassAO
  }

  private async applyBloomTSL(currentColorNode: any, config: any): Promise<any> {
    try {
      const bloomPass = bloom(currentColorNode)
      bloomPass.strength.value = 0.1
      const finalBloom = currentColorNode.add(bloomPass)

      return finalBloom
    } catch (error) {
      console.warn('Failed to apply bloom TSL effect:', error)
      return currentColorNode
    }
  }

  private async applyFXAATSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      if (tsl.fxaa) {
        return tsl.fxaa(inputNode)
      }
      return inputNode
    } catch (error) {
      console.warn('Failed to apply FXAA TSL effect:', error)
      return inputNode
    }
  }

  private async applyToneMappingTSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      if (tsl.toneMapping) {
        return tsl.toneMapping(inputNode, {
          mode: config.mode || 'AGX',
          exposure: config.maxLuminance || 4.0
        })
      }
      return inputNode
    } catch (error) {
      console.warn('Failed to apply tone mapping TSL effect:', error)
      return inputNode
    }
  }

  private async applyNoiseTSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      if (tsl.noise) {
        return tsl.noise(inputNode, {
          strength: config.strength || 0.1
        })
      }
      return inputNode
    } catch (error) {
      console.warn('Failed to apply noise TSL effect:', error)
      return inputNode
    }
  }

  private async applyVignetteTSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      if (tsl.vignette) {
        return tsl.vignette(inputNode, {
          offset: config.offset || 0.5,
          darkness: config.darkness || 0.5
        })
      }
      return inputNode
    } catch (error) {
      console.warn('Failed to apply vignette TSL effect:', error)
      return inputNode
    }
  }

  private async applyChromaticAberrationTSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      if (tsl.chromaticAberration) {
        return tsl.chromaticAberration(inputNode, {
          offset: config.offset || [0.001, 0.0005]
        })
      }
      return inputNode
    } catch (error) {
      console.warn('Failed to apply chromatic aberration TSL effect:', error)
      return inputNode
    }
  }

  private async applyDotScreenTSL(tsl: any, inputNode: any, config: any): Promise<any> {
    try {
      const { dotScreen } = await import('three/addons/tsl/display/DotScreenNode.js')

      const dotScreenPass = dotScreen(inputNode)
      dotScreenPass.scale.value = config.scale || 1.0

      return dotScreenPass
    } catch (error) {
      console.warn('Failed to apply dot screen TSL effect:', error)
      return inputNode
    }
  }

  render(): void {
    if (this.postProcessing) {
      try {
        this.postProcessing.render()
      } catch (error) {
        console.warn('WebGPU post processing render failed:', error)
      }
    }
  }

  getPostProcessing(): PostProcessing {
    return this.postProcessing
  }

  getEffectNodes(): WebGPUEffectNode[] {
    return this.effectNodes
  }

  getOutputNode(): WebGPUEffectNode | null {
    return this.outputNode
  }

  dispose(): void {
    this.effectNodes = []
    this.outputNode = null

    if (this.postProcessing && typeof (this.postProcessing as any).dispose === 'function') {
      ;(this.postProcessing as any).dispose()
    }
  }
}

export function createWebGPUPostProcessingPipeline(
  renderer: WebGPURenderer,
  scene: Scene,
  camera: ArrayCamera
): WebGPUPostProcessingPipeline {
  return new WebGPUPostProcessingPipeline(renderer, scene, camera)
}
