import React, { useEffect, useLayoutEffect } from 'react'

import {
  entityExists,
  EntityUUID,
  getOptionalComponent,
  removeComponent,
  setComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { AvatarColliderComponent } from '@ir-engine/engine/src/avatar/components/AvatarControllerComponent'
import { spawnAvatarReceptor } from '@ir-engine/engine/src/avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { defineState, getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { GLTFComponent } from '../../gltf/GLTFComponent'

export const AvatarState = defineState({
  name: 'ee.engine.avatar.AvatarState',

  initial: {} as Record<
    EntityUUID,
    {
      avatarURL: string
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawn.receive((action) => {
      const avatarUUID = UUIDComponent.join({ entitySourceID: action.entitySourceID, entityID: action.entityID })
      getMutableState(AvatarState)[avatarUUID].merge({
        avatarURL: action.avatarURL,
        name: action.name
      })
    }),
    onSetAvatarID: AvatarNetworkAction.setAvatarURL.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ avatarURL: action.avatarURL })
    }),
    onSetAvatarName: AvatarNetworkAction.setName.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarState = useMutableState(AvatarState)

    return (
      <>
        {avatarState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const { avatarURL, name } = useHookstate(getMutableState(AvatarState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useLayoutEffect(() => {
    if (!entity) return
    spawnAvatarReceptor(entityUUID)
  }, [entity])

  useEffect(() => {
    if (!entity || !avatarURL.value) return

    setComponent(entity, GLTFComponent, { src: avatarURL.value })

    return () => {
      if (!entityExists(entity)) return
      removeComponent(entity, GLTFComponent)
    }
  }, [avatarURL.value, entity])

  useEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, name.value + "'s avatar")
    const colliderEntity = getOptionalComponent(entity, AvatarColliderComponent)?.colliderEntity
    if (colliderEntity) {
      setComponent(colliderEntity, NameComponent, name.value + "'s collider")
    }
  }, [name, entity])

  return null
}
