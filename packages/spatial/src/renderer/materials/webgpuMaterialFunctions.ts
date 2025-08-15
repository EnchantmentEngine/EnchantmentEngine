import { Entity } from '@ir-engine/ecs'
import { Material } from 'three'
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial, NodeMaterial } from 'three/webgpu'
import { isWebGPURenderer } from '../functions/RendererBackendUtils'

export const shouldUseNodeMaterial = (rendererEntity: Entity): boolean => {
  return isWebGPURenderer(rendererEntity)
}

export const convertToNodeMaterial = (material: Material, rendererEntity: Entity): NodeMaterial | null => {
  if (!shouldUseNodeMaterial(rendererEntity)) {
    return null
  }

  switch (material.type) {
    case 'MeshStandardMaterial':
      return convertStandardToNodeMaterial(material as any)
    case 'MeshBasicMaterial':
      return convertBasicToNodeMaterial(material as any)
    default:
      console.warn(`Material type ${material.type} not yet supported for WebGPU node conversion`)
      return null
  }
}

const convertStandardToNodeMaterial = (material: any): MeshStandardNodeMaterial => {
  const nodeMaterial = new MeshStandardNodeMaterial()

  nodeMaterial.color.copy(material.color)
  nodeMaterial.opacity = material.opacity
  nodeMaterial.transparent = material.transparent
  nodeMaterial.side = material.side

  nodeMaterial.metalness = material.metalness
  nodeMaterial.roughness = material.roughness
  nodeMaterial.emissive.copy(material.emissive)
  nodeMaterial.emissiveIntensity = material.emissiveIntensity

  if (material.map) nodeMaterial.map = material.map
  if (material.normalMap) nodeMaterial.normalMap = material.normalMap
  if (material.roughnessMap) nodeMaterial.roughnessMap = material.roughnessMap
  if (material.metalnessMap) nodeMaterial.metalnessMap = material.metalnessMap
  if (material.emissiveMap) nodeMaterial.emissiveMap = material.emissiveMap
  if (material.aoMap) nodeMaterial.aoMap = material.aoMap
  if (material.envMap) nodeMaterial.envMap = material.envMap

  return nodeMaterial
}

/**
 * Convert MeshBasicMaterial to MeshBasicNodeMaterial
 */
const convertBasicToNodeMaterial = (material: any): MeshBasicNodeMaterial => {
  const nodeMaterial = new MeshBasicNodeMaterial()

  // Copy basic properties
  nodeMaterial.color.copy(material.color)
  nodeMaterial.opacity = material.opacity
  nodeMaterial.transparent = material.transparent
  nodeMaterial.side = material.side

  // Copy textures
  if (material.map) nodeMaterial.map = material.map
  if (material.envMap) nodeMaterial.envMap = material.envMap

  return nodeMaterial
}
