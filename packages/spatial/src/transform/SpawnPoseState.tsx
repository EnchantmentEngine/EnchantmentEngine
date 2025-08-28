import React, { useLayoutEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID, setComponent, UUIDComponent, WorldNetworkAction } from '@ir-engine/ecs'
import { defineState, getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { TransformComponent } from './components/TransformComponent'
import { SpawnObjectActions } from './SpawnObjectActions'

export const SpawnPoseState = defineState({
  name: 'ee.SpawnPoseState',

  initial: {} as Record<
    EntityUUID,
    {
      spawnPosition: Vector3
      spawnRotation: Quaternion
    }
  >,

  receptors: {
    onSpawnObject: SpawnObjectActions.spawnObject.receive((action) => {
      getMutableState(SpawnPoseState)[
        UUIDComponent.join({
          entitySourceID: action.entitySourceID ?? action.parentUUID,
          entityID: action.entityID
        })
      ].merge({
        spawnPosition: action.position ? new Vector3().copy(action.position) : new Vector3(),
        spawnRotation: action.rotation ? new Quaternion().copy(action.rotation) : new Quaternion()
      })
    }),

    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(SpawnPoseState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(SpawnPoseState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  }
})

const EntityNetworkReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(SpawnPoseState)[props.uuid])
  const entity = UUIDComponent.useEntityByUUID(props.uuid)

  useLayoutEffect(() => {
    if (!entity) return
    setComponent(entity, TransformComponent, {
      position: state.spawnPosition.value,
      rotation: state.spawnRotation.value
    })
  }, [entity, state.spawnPosition, state.spawnRotation])

  return null
}
