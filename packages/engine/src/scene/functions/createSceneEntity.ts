import {
  Entity,
  EntityTreeComponent,
  LayerComponent,
  Layers,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  setComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFComponent } from '../../gltf/GLTFComponent'

export const createSceneEntity = (name: string, parentEntity: Entity = UndefinedEntity): Entity => {
  const sourceID = GLTFComponent.getSourceID(parentEntity) || ('source' as SourceID)
  const layer = parentEntity ? LayerComponent.get(parentEntity) : Layers.Simulation
  const entity = createEntity(layer)
  setComponent(entity, UUIDComponent, { entitySourceID: sourceID, entityID: UUIDComponent.generate() })
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent)
  if (parentEntity !== UndefinedEntity) {
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }
  return entity
}
