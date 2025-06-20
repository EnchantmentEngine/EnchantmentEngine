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
