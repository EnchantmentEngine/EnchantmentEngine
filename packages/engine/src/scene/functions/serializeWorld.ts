import { getAllComponents, serializeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { ComponentJsonType } from '../types/SceneTypes'

export const serializeEntity = (entity: Entity) => {
  const jsonComponents = [] as ComponentJsonType[]
  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = component.jsonID
    if (sceneComponentID) {
      const data = serializeComponent(entity, component)
      if (data) {
        jsonComponents.push({
          name: sceneComponentID,
          props: data
        })
      }
    }
  }
  return jsonComponents
}
