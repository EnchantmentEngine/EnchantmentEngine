import { GLTF } from '@gltf-transform/core'
import { SerializedComponentType } from '@ir-engine/ecs'
import { EEMaterialComponent } from './MaterialExtensionComponents'

export const EEMaterialMigrationRegistry = {} as Record<string, string> // prototype name to jsonID

EEMaterialMigrationRegistry['HolographicMaterial'] = 'IR_material_holographic'

export const migrateEEMaterial = (gltf: GLTF.IGLTF) => {
  if (gltf.extensions) {
    if (gltf.extensions['IR_scene_delta']) {
      for (const nodeDeltas of Object.values(gltf.extensions['IR_scene_delta'])) {
        for (const nodeDelta of Object.values(nodeDeltas) as any) {
          if (nodeDelta.prototypeConstructor) {
            nodeDelta[EEMaterialMigrationRegistry[nodeDelta.prototypeConstructor]] = nodeDelta.materialParameters
            delete nodeDelta.materialParameters
            delete nodeDelta.prototypeConstructor
          }
        }
      }
    }
  }

  if (!gltf.extensionsUsed?.includes('EE_material')) return gltf

  for (const material of gltf.materials || []) {
    if (!material.extensions) continue
    const eeMaterial = material.extensions!.EE_material as SerializedComponentType<typeof EEMaterialComponent>
    if (!eeMaterial?.prototype) continue
    if (!EEMaterialMigrationRegistry[eeMaterial.prototype]) continue
    const jsonID = EEMaterialMigrationRegistry[eeMaterial.prototype]
    material.extensions[jsonID] = {
      ...Object.fromEntries(Object.entries(eeMaterial.args).map(([k, v]) => [k, v.contents]))
    }
    delete material.extensions.EE_material
  }

  return gltf
}
