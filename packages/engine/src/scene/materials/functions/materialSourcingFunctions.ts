import { Entity, EntityUUID, getComponent, hasComponent, UUIDComponent } from '@ir-engine/ecs'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'

/**Gets all materials used by child and self entity */
export const getMaterialsFromScene = (source: Entity) => {
  const sourceID = UUIDComponent.getAsSourceID(source)
  const childEntities = UUIDComponent.getEntitiesBySource(sourceID)
  childEntities.push(source)
  const materials = {} as Record<EntityUUID, Entity>
  for (const entity of childEntities) {
    if (hasComponent(entity, MaterialInstanceComponent)) {
      const materialComponent = getComponent(entity, MaterialInstanceComponent)
      for (const mat of materialComponent.entities!) {
        materials[mat] = entity
      }
    }
  }
  return Object.keys(materials) as any as EntityUUID[]
}
