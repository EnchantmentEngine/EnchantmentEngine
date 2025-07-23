import {
  createEntity,
  Entity,
  EntityID,
  EntityTreeComponent,
  getComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'

import { GLTF } from '@gltf-transform/core'
import { TransformComponent } from '@ir-engine/spatial'
import { exportGLTFScene } from '../../gltf/exportGLTFScene'

export default async function exportMaterialsGLTF(
  materialEntities: Entity[],
  exporterArgs: {
    binary: boolean
    relativePath: string
    projectName: string
  }
): Promise<GLTF.IGLTF | undefined> {
  if (materialEntities.length === 0) return
  const rootEntity = createEntity()
  setComponent(rootEntity, UUIDComponent, {
    entitySourceID: 'detatched' as SourceID,
    entityID: 'material' as EntityID
  })
  setComponent(rootEntity, TransformComponent)
  setComponent(rootEntity, EntityTreeComponent)
  // hacky way to set the root entity as the parent of all material entities
  getComponent(rootEntity, EntityTreeComponent).children = [...materialEntities]
  const [gltf] = await exportGLTFScene(rootEntity, exporterArgs.projectName, exporterArgs.relativePath, false)
  return gltf
}
