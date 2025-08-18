import { ArrayCamera, Scene } from 'three'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { ao } from 'three/addons/tsl/display/GTAONode.js'
import { mrt, normalView, output, pass } from 'three/tsl'
import { PostProcessing } from 'three/webgpu'
import { createWebGPUEffectNodes, WebGPUEffectNode } from './WebGPUEffectNodes'

// Update (rebuild) the WebGPU post processing chain declaratively
export function updateWebGPUPostProcessing(
  postProcessing: PostProcessing,
  scene: Scene,
  camera: ArrayCamera,
  effects: Record<string, any>
): void {
  try {
    const effectNodes = createWebGPUEffectNodes(effects)

    // Base scene pass + MRT (similar to previous implementation)
    const scenePass = pass(scene, camera)
    scenePass.setMRT(
      mrt({
        output: output,
        normal: normalView
      })
    )

    const passInfo = {
      color: scenePass.getTextureNode('output'),
      normal: scenePass.getTextureNode('normal'),
      depth: scenePass.getTextureNode('depth')
    }

    let currentColorNode = passInfo.color

    for (const effectNode of effectNodes) {
      currentColorNode = applyEffectNode(passInfo, camera, effectNode, currentColorNode)
    }

    postProcessing.outputNode = currentColorNode
    postProcessing.needsUpdate = true
  } catch (error) {
    console.warn('Failed to update WebGPU post processing chain:', error)
    try {
      const fallback = pass(scene, camera)
      postProcessing.outputNode = fallback
    } catch (fallbackErr) {
      console.warn('Failed to set fallback WebGPU scene pass:', fallbackErr)
    }
  }
}

function applyEffectNode(passInfo: any, camera: ArrayCamera, effectNode: WebGPUEffectNode, currentColorNode: any): any {
  switch (effectNode.type) {
    case 'BloomEffect':
      return applyBloom(currentColorNode, effectNode.config)
    case 'SSAOEffect':
      return applySSAO(passInfo, camera, currentColorNode, effectNode.config)
    default:
      return currentColorNode
  }
}

function applyBloom(currentColorNode: any, _config: any): any {
  try {
    const bloomPass = bloom(currentColorNode)
    bloomPass.strength.value = 0.1
    return currentColorNode.add(bloomPass)
  } catch (e) {
    console.warn('Bloom effect failed:', e)
    return currentColorNode
  }
}

function applySSAO(passInfo: any, camera: ArrayCamera, currentColorNode: any, _config: any): any {
  try {
    const aoPass = ao(passInfo.depth, passInfo.normal, camera)
    aoPass.distanceExponent.value = 1.0
    aoPass.distanceFallOff.value = 1.0
    aoPass.radius.value = 0.1
    return aoPass.getTextureNode().mul(currentColorNode)
  } catch (e) {
    console.warn('SSAO effect failed:', e)
    return currentColorNode
  }
}
