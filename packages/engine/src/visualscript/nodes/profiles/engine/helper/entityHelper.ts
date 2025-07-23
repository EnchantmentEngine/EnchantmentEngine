import { EntityTreeComponent, UUIDComponent, createEntity } from '@ir-engine/ecs'
import { ComponentJSONIDMap, getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, SourceID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

export const addEntityToScene = (
  componentJson: Array<ComponentJsonType>,
  parentEntity = UndefinedEntity,
  beforeEntity = UndefinedEntity as Entity
) => {
  const newEntity = createEntity()
  let childIndex = undefined as undefined | number
  if (beforeEntity) {
    const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
    if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
      childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
    }
  }
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })
  setComponent(newEntity, TransformComponent)
  setComponent(newEntity, UUIDComponent, {
    entitySourceID: 'visual-script' as SourceID,
    entityID: UUIDComponent.generate()
  })
  setComponent(newEntity, VisibleComponent)
  for (const component of componentJson) {
    if (ComponentJSONIDMap.has(component.name))
      setComponent(newEntity, ComponentJSONIDMap.get(component.name)!, component.props)
  }

  return newEntity
}
