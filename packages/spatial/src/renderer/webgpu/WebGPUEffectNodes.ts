import { getState } from '@ir-engine/hyperflux'
import { ArrayCamera, Scene } from 'three'
import { PostProcessingEffectState } from '../effects/EffectRegistry'

export interface WebGPUEffectNode {
  type: string
  input?: WebGPUEffectNode
  config: any
  priority: number
  tslNode?: any
}

export function createWebGPUScenePass(scene: Scene, camera: ArrayCamera): WebGPUEffectNode {
  return {
    type: 'scenePass',
    config: { scene, camera },
    priority: -1000 // Scene pass should always be first
  }
}

export function createWebGPUEffectNodes(effects: Record<string, any>): WebGPUEffectNode[] {
  const effectRegistry = getState(PostProcessingEffectState)
  const nodes: WebGPUEffectNode[] = []

  for (const effectKey in effects) {
    const effectData = effects[effectKey]
    const registryEntry = effectRegistry[effectKey]

    if (!effectData?.isActive || !registryEntry) continue

    const node = createWebGPUEffectNode(effectKey, effectData, registryEntry)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.sort((a, b) => a.priority - b.priority)

  return nodes
}

function createWebGPUEffectNode(effectKey: string, effectData: any, registryEntry: any): WebGPUEffectNode | null {
  const priority = effectData.priority || 0

  switch (effectKey) {
    case 'BloomEffect':
      return createBloomEffectNode(effectData, priority)
    case 'FXAAEffect':
      return createFXAAEffectNode(effectData, priority)
    case 'ToneMappingEffect':
      return createToneMappingEffectNode(effectData, priority)
    case 'SMAAEffect':
      return createSMAAEffectNode(effectData, priority)
    case 'SSAOEffect':
      return createSSAOEffectNode(effectData, priority)
    case 'NoiseEffect':
      return createNoiseEffectNode(effectData, priority)
    case 'VignetteEffect':
      return createVignetteEffectNode(effectData, priority)
    case 'HueSaturationEffect':
      return createHueSaturationEffectNode(effectData, priority)
    case 'BrightnessContrastEffect':
      return createBrightnessContrastEffectNode(effectData, priority)
    case 'ChromaticAberrationEffect':
      return createChromaticAberrationEffectNode(effectData, priority)
    case 'ColorDepthEffect':
      return createColorDepthEffectNode(effectData, priority)
    case 'DotScreenEffect':
      return createDotScreenEffectNode(effectData, priority)
    case 'GlitchEffect':
      return createGlitchEffectNode(effectData, priority)
    case 'GridEffect':
      return createGridEffectNode(effectData, priority)
    case 'LensDistortionEffect':
      return createLensDistortionEffectNode(effectData, priority)
    case 'PixelationEffect':
      return createPixelationEffectNode(effectData, priority)
    case 'ScanlineEffect':
      return createScanlineEffectNode(effectData, priority)
    case 'TiltShiftEffect':
      return createTiltShiftEffectNode(effectData, priority)
    case 'DepthOfFieldEffect':
      return createDepthOfFieldEffectNode(effectData, priority)
    case 'LinearTosRGBEffect':
      return createLinearTosRGBEffectNode(effectData, priority)
    case 'ColorAverageEffect':
      return createColorAverageEffectNode(effectData, priority)
    case 'LUT1DEffect':
      return createLUT1DEffectNode(effectData, priority)
    case 'LUT3DEffect':
      return createLUT3DEffectNode(effectData, priority)
    default:
      console.warn(`WebGPU effect node for ${effectKey} not implemented yet`)
      return null
  }
}

function createBloomEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'BloomEffect',
    config: {
      intensity: config.intensity ?? 1.0,
      radius: config.radius ?? 0.85,
      luminanceThreshold: config.luminanceThreshold ?? 0.9,
      luminanceSmoothing: config.luminanceSmoothing ?? 0.025,
      levels: config.levels ?? 8,
      blendFunction: config.blendFunction ?? 'SCREEN'
    },
    priority
  }
}

function createFXAAEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'FXAAEffect',
    config: {
      blendFunction: config.blendFunction ?? 'SRC'
    },
    priority
  }
}

function createToneMappingEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'ToneMappingEffect',
    config: {
      blendFunction: config.blendFunction ?? 'SRC',
      adaptive: config.adaptive ?? false,
      mode: config.mode ?? 'AGX',
      resolution: config.resolution ?? 256,
      maxLuminance: config.maxLuminance ?? 4.0,
      whitePoint: config.whitePoint ?? 4.0,
      middleGrey: config.middleGrey ?? 0.6,
      minLuminance: config.minLuminance ?? 0.01,
      averageLuminance: config.averageLuminance ?? 1.0,
      adaptationRate: config.adaptationRate ?? 1.0
    },
    priority
  }
}

function createSMAAEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'SMAAEffect',
    config: {
      preset: config.preset ?? 'MEDIUM',
      edgeDetectionMode: config.edgeDetectionMode ?? 'COLOR',
      predicationMode: config.predicationMode ?? 'DISABLED'
    },
    priority
  }
}

function createSSAOEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'SSAOEffect',
    config: {
      blendFunction: config.blendFunction ?? 'MULTIPLY',
      samples: config.samples ?? 9,
      rings: config.rings ?? 7,
      distanceThreshold: config.distanceThreshold ?? 0.97,
      distanceFalloff: config.distanceFalloff ?? 0.03,
      rangeThreshold: config.rangeThreshold ?? 0.0005,
      rangeFalloff: config.rangeFalloff ?? 0.001,
      luminanceInfluence: config.luminanceInfluence ?? 0.7,
      radius: config.radius ?? 0.1825,
      scale: config.scale ?? 0.5,
      bias: config.bias ?? 0.5
    },
    priority
  }
}

function createNoiseEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'NoiseEffect',
    config: {
      blendFunction: config.blendFunction ?? 'SCREEN',
      premultiply: config.premultiply ?? false
    },
    priority
  }
}

function createVignetteEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'VignetteEffect',
    config: {
      blendFunction: config.blendFunction ?? 'NORMAL',
      technique: config.technique ?? 'DEFAULT',
      eskil: config.eskil ?? false,
      offset: config.offset ?? 0.5,
      darkness: config.darkness ?? 0.5
    },
    priority
  }
}

function createHueSaturationEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'HueSaturationEffect',
    config: {
      blendFunction: config.blendFunction ?? 'SRC',
      hue: config.hue ?? 0,
      saturation: config.saturation ?? 0.0
    },
    priority
  }
}

function createBrightnessContrastEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'BrightnessContrastEffect',
    config: {
      blendFunction: config.blendFunction ?? 'SRC',
      brightness: config.brightness ?? 0.0,
      contrast: config.contrast ?? 0.0
    },
    priority
  }
}

function createChromaticAberrationEffectNode(config: any, priority: number): WebGPUEffectNode {
  return {
    type: 'ChromaticAberrationEffect',
    config: {
      blendFunction: config.blendFunction ?? 'NORMAL',
      offset: config.offset ?? [0.001, 0.0005],
      radialModulation: config.radialModulation ?? false,
      modulationOffset: config.modulationOffset ?? 0.15
    },
    priority
  }
}

function createColorDepthEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'ColorDepthEffect', config, priority }
}

function createDotScreenEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'DotScreenEffect', config, priority }
}

function createGlitchEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'GlitchEffect', config, priority }
}

function createGridEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'GridEffect', config, priority }
}

function createLensDistortionEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'LensDistortionEffect', config, priority }
}

function createPixelationEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'PixelationEffect', config, priority }
}

function createScanlineEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'ScanlineEffect', config, priority }
}

function createTiltShiftEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'TiltShiftEffect', config, priority }
}

function createDepthOfFieldEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'DepthOfFieldEffect', config, priority }
}

function createLinearTosRGBEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'LinearTosRGBEffect', config, priority }
}

function createColorAverageEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'ColorAverageEffect', config, priority }
}

function createLUT1DEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'LUT1DEffect', config, priority }
}

function createLUT3DEffectNode(config: any, priority: number): WebGPUEffectNode {
  return { type: 'LUT3DEffect', config, priority }
}
