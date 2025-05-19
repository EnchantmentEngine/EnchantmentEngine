import { defineQuery, defineSystem, getComponent, PresentationSystemGroup, useQuery } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useMutableState } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { ColliderLoadingState } from '../state/ColliderLoadingState'

const colliderQuery = defineQuery([ColliderComponent])

const execute = () => {
  const colliderState = useMutableState(ColliderLoadingState)
  for (const entity of colliderQuery()) {
    const collider = getComponent(entity, ColliderComponent)

    // If this is a new collider, register it
    if (!colliderState.pendingColliders.value.has(entity)) {
      ColliderLoadingState.registerPendingCollider(entity)
    }

    // Check if the collider is loaded
    if (!colliderState.pendingColliders.value.has(entity)) {
      ColliderLoadingState.markColliderLoaded(entity)
    }
  }
}

const SceneLoadingReactor = (props: { sceneEntity: Entity }) => {
  const { sceneEntity } = props
  const sceneLoaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const colliderState = useMutableState(ColliderLoadingState)

  // Reset collider tracking when a new scene loads
  useEffect(() => {
    if (sceneLoaded) {
      // Give a short delay to allow colliders to register
      setTimeout(() => {
        // If no colliders were registered, mark all as loaded
        if (colliderState.pendingColliders.keys.length === 0) {
          colliderState.allCollidersLoaded.set(true)
        }
      }, 500)
    } else {
      ColliderLoadingState.reset()
    }
  }, [sceneLoaded])

  return null
}

const Reactor = () => {
  const sceneQuery = useQuery([SceneComponent, GLTFComponent])

  if (sceneQuery.length === 0) return null

  return <SceneLoadingReactor sceneEntity={sceneQuery[0]} />
}

export const ColliderLoadingSystem = defineSystem({
  uuid: 'ee.engine.ColliderLoadingSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor: () => <Reactor />
})
