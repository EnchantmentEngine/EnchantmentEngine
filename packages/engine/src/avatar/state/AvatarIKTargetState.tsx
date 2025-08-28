import React, { useLayoutEffect } from 'react'

import { EntityUUID, NetworkObjectSendPeriodicUpdatesTag, UUIDComponent, WorldNetworkAction } from '@ir-engine/ecs'
import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineState, getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

export const AvatarIKTargetState = defineState({
  name: 'ee.engine.avatar.AvatarIKTargetState',

  initial: {} as Record<
    EntityUUID,
    {
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawnIKTarget.receive((action) => {
      getMutableState(AvatarIKTargetState)[
        UUIDComponent.join({ entitySourceID: action.entitySourceID!, entityID: action.entityID })
      ].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(AvatarIKTargetState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarIKTargetState = useMutableState(AvatarIKTargetState)
    return (
      <>
        {avatarIKTargetState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(AvatarIKTargetState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useLayoutEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, state.name.value)
    setComponent(entity, AvatarIKTargetComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)
  }, [entity])

  return null
}
