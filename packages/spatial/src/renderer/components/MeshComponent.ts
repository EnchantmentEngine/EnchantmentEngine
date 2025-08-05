import { Mesh } from 'three'

import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { Entity, S, UndefinedEntity } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { MaterialComponent, MaterialInstanceComponent, MaterialMapState } from '../../materials/MaterialComponent'
import { ObjectComponent } from './ObjectComponent'

export const MeshComponent = defineComponent({
  name: 'MeshComponent',

  schema: S.Type<Mesh>({ required: true }),

  onSet(entity, component, json) {
    MeshComponent.valueMap[entity] = json as Mesh
    setComponent(entity, ObjectComponent, json as Mesh)

    handleProxyMaterial(entity, json as Mesh)
  },

  onRemove(entity, component) {
    removeComponent(entity, ObjectComponent)
  }
})

const handleProxyMaterial = (entity: Entity, mesh: Mesh) => {
  Object.assign(mesh, {
    get material() {
      const materialInstance = getOptionalComponent(entity, MaterialInstanceComponent)
      if (!materialInstance) {
        // If the ECS has no material instance for this mesh entity, try to see if one is assigned to the entity, otherwise return the default material
        return MaterialComponent.get(entity) ?? getState(MaterialMapState).get(UndefinedEntity)!
      }
      if (materialInstance.entities.length === 1) {
        // If the material instance has only one entity, return the material for that entity
        return (
          (materialInstance.entities[0] && MaterialComponent.get(materialInstance.entities[0])) ??
          getState(MaterialMapState).get(UndefinedEntity)!
        )
      }
      // If the material instance has multiple entities, return the material for the first entity
      return materialInstance.entities.map(_mapEntityToMaterial)
    },

    set material(_) {
      throw new Error(
        'Setting material directly on MeshComponent is not supported. Use MaterialInstanceComponent to manage materials.'
      )
    }
  })
}

const _mapEntityToMaterial = (entity: Entity) =>
  MaterialComponent.get(entity) ?? getState(MaterialMapState).get(UndefinedEntity)!
