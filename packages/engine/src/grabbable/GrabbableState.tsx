import React, { useEffect } from 'react'

import {
  entityExists,
  EntityNetworkState,
  EntityUUID,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  HyperFlux,
  none,
  SceneUser,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'

import { getChildrenWithComponents } from '@ir-engine/ecs'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import '@ir-engine/spatial/src/transform/SpawnPoseState'
import { GrabbableNetworkAction, GrabbedComponent, GrabberComponent } from './GrabbableComponent'

export const GrabbableState = defineState({
  name: 'ee.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right'
      grabberEntityUUID: EntityUUID
    }
  >,

  receptors: {
    onSetGrabbedObject: GrabbableNetworkAction.setGrabbedObject.receive((action) => {
      const state = getMutableState(GrabbableState)
      if (action.grabbed)
        state[action.entityUUID].set({
          attachmentPoint: action.attachmentPoint ?? 'right',
          grabberEntityUUID: action.grabberEntityUUID
        })
      else state[action.entityUUID].set(none)
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      const state = getMutableState(GrabbableState)
      state[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const grabbableState = useMutableState(GrabbableState)
    return (
      <>
        {grabbableState.keys.map((entityUUID: EntityUUID) => (
          <GrabbableReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const GrabbableReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])

  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const grabberEntity = UUIDComponent.useEntityByUUID(state.grabberEntityUUID.value as EntityUUID)

  const attachmentPoint = state.attachmentPoint.value

  const entityNetworkState = useMutableState(EntityNetworkState).value

  const ownedByScene = entityNetworkState[entityUUID]?.ownerId === SceneUser
  const grabbableAuthorityPeer = entityNetworkState[entityUUID]?.authorityPeerId
  const grabberAuthorityPeer = entityNetworkState[state.grabberEntityUUID.value]?.authorityPeerId

  const hasAuthority = grabbableAuthorityPeer === grabberAuthorityPeer

  useEffect(() => {
    if (!entity || !grabberEntity || !hasAuthority) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    if (hasComponent(entity, RigidBodyComponent)) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      Physics.wakeUp(Physics.getWorld(entity)!, entity)

      const colliders = [entity, ...getChildrenWithComponents(entity, [ColliderComponent])]

      for (const collider of colliders) {
        if (!hasComponent(collider, ColliderComponent)) continue
        getMutableComponent(collider, ColliderComponent).collisionMask.set((mask) => (mask ^= CollisionGroups.Avatars))
      }
    }

    return () => {
      if (entityExists(grabberEntity)) setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      removeComponent(entity, GrabbedComponent)
      if (hasComponent(entity, RigidBodyComponent)) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.wakeUp(Physics.getWorld(entity)!, entity)

        const colliders = [entity, ...getChildrenWithComponents(entity, [ColliderComponent])]

        for (const collider of colliders) {
          if (!hasComponent(collider, ColliderComponent)) continue
          getMutableComponent(collider, ColliderComponent).collisionMask.set(
            (mask) => (mask ^= CollisionGroups.Avatars)
          )
        }
      }
    }
  }, [entity, grabberEntity, hasAuthority])

  const needsToRequestAuthority =
    entity !== UndefinedEntity &&
    grabberEntity !== UndefinedEntity &&
    (ownedByScene || grabbableAuthorityPeer !== grabberAuthorityPeer) &&
    grabberAuthorityPeer === HyperFlux.store.peerID

  useEffect(() => {
    if (!needsToRequestAuthority) return
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID,
        newAuthority: HyperFlux.store.peerID,
        $to: ownedByScene ? HyperFlux.store.peerID : grabbableAuthorityPeer
      })
    )
  }, [needsToRequestAuthority])

  return null
}
