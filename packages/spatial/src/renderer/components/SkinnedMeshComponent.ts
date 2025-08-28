import { SkinnedMesh } from 'three'

import { defineComponent, removeComponent, setComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { MeshComponent } from './MeshComponent'

export const SkinnedMeshComponent = defineComponent({
  name: 'SkinnedMeshComponent',
  schema: Schema.Type<SkinnedMesh>({ required: true }),

  onSet(entity, component, json) {
    SkinnedMeshComponent.valueMap[entity] = json as SkinnedMesh
    setComponent(entity, MeshComponent, json as SkinnedMesh)
  },

  onRemove(entity, component) {
    removeComponent(entity, MeshComponent)
  }
})
