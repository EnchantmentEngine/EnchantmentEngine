import { Mesh } from 'three'

import { defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { Schema } from '@ir-engine/hyperflux'
import { ObjectComponent } from './ObjectComponent'

export const MeshComponent = defineComponent({
  name: 'MeshComponent',

  schema: Schema.Type<Mesh>({ required: true }),

  onSet(entity, component, json) {
    MeshComponent.valueMap[entity] = json as Mesh
    setComponent(entity, ObjectComponent, json as Mesh)
  },

  onRemove(entity, component) {
    removeComponent(entity, ObjectComponent)
  }
})
