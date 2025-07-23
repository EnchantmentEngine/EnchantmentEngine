import { defineComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

export const VisibleComponent = defineComponent({
  name: 'VisibleComponent',
  jsonID: 'EE_visible',

  toJSON(component) {
    return {}
  }
})

export const setVisibleComponent = (entity: Entity, visible: boolean) => {
  if (visible) {
    !hasComponent(entity, VisibleComponent) && setComponent(entity, VisibleComponent, true)
  } else removeComponent(entity, VisibleComponent)
}
