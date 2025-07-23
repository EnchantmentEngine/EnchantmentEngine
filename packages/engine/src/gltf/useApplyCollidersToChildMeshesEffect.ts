import {
  Entity,
  entityExists,
  getTreeFromChildToAncestor,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useAncestorWithComponents,
  useComponent,
  useOptionalComponent,
  useQueryBySource,
  UUIDComponent
} from '@ir-engine/ecs'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useLayoutEffect } from 'react'
import { GLTFComponent } from './GLTFComponent'

function forceUpdateMatrices(childEntity: Entity, ancestorEntity: Entity = UndefinedEntity) {
  const entities = [] as Entity[]
  getTreeFromChildToAncestor(childEntity, entities, ancestorEntity)
  if (entities.length === 0) return
  for (let i = entities.length - 1; i >= 0; i--) {
    TransformComponent.computeTransformMatrix(entities[i])
  }
}

/**
 * Applies colliders to entity and all child entites with MeshComponent
 * @param entity
 */
export function useApplyCollidersToChildMeshesEffect(entity: Entity) {
  const childMeshEntities = useQueryBySource(entity, [MeshComponent])
  const physicsWorld = Physics.useWorld(entity)
  const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
  const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
  const component = useComponent(entity, GLTFComponent)

  useLayoutEffect(() => {
    if (
      !rigidbodyComponent?.initialized?.value ||
      !physicsWorld ||
      !physicsWorld.Rigidbodies.has(rigidbodyEntity) ||
      !component.applyColliders.value
    )
      return

    forceUpdateMatrices(entity)
    const children = [...childMeshEntities]
    if (hasComponent(entity, MeshComponent)) children.push(entity)

    const added = [] as Entity[]
    for (const child of children) {
      // Don't add colliders to meshes with colliders baked in or helper meshes
      if (entityExists(child) && !hasComponent(child, ColliderComponent) && hasComponent(child, UUIDComponent)) {
        setComponent(child, ColliderComponent, { shape: component.shape.value, matchMesh: true })
        forceUpdateMatrices(child)
        added.push(child)
      }
    }

    return () => {
      for (const addedEntity of added) {
        if (entityExists(addedEntity)) removeComponent(addedEntity, ColliderComponent)
      }
    }
  }, [
    entity,
    physicsWorld,
    component.shape,
    !!rigidbodyComponent?.initialized?.value,
    component.applyColliders.value,
    childMeshEntities
  ])
}
