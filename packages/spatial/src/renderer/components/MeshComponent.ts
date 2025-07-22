import { Mesh } from 'three'

import { defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { S } from '@ir-engine/ecs'
import { ObjectComponent } from './ObjectComponent'

export const MeshComponent = defineComponent({
  name: 'MeshComponent',

  schema: S.Type<Mesh>({ required: true }),

  onSet(entity, component, json) {
    setComponent(entity, ObjectComponent, json as Mesh)
    component.set(json as Mesh)
  },

  onRemove(entity, component) {
    removeComponent(entity, ObjectComponent)
  }
})
