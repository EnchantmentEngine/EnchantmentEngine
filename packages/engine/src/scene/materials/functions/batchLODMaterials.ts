import { addOBCPlugin, removeOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { Material } from 'three'

interface LODMaterialPlugin {
  minDistance: number
  maxDistance: number
}

const plugin = {
  id: 'lod-culling',
  priority: 1,
  compile: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'uniform float opacity;',
      `uniform float opacity;
uniform float maxDistance;
uniform float minDistance;`
    )

    // Calculate the camera distance from the geometry
    // Discard fragments outside the minDistance and maxDistance range
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `void main() {
float cameraDistance = length(vViewPosition);
if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
discard;
}`
    )

    shader.uniforms.minDistance = { value: 0 }
    shader.uniforms.maxDistance = { value: 0 }
  }
}

export const batchApplyLOD = (mat: Material | Material[], params: LODMaterialPlugin) => {
  const materials = Array.isArray(mat) ? mat : [mat]

  for (const material of materials) {
    addOBCPlugin(material, plugin)
  }
}

export const batchRemoveLOD = (mat: Material | Material[]) => {
  const materials = Array.isArray(mat) ? mat : [mat]

  for (const material of materials) {
    removeOBCPlugin(material, plugin)
  }
}
